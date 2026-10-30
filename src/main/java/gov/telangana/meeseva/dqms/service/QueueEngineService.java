package gov.telangana.meeseva.dqms.service;

import gov.telangana.meeseva.dqms.model.*;
import gov.telangana.meeseva.dqms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class QueueEngineService {

    private final QueueTicketRepository ticketRepository;
    private final QueueStatusHistoryRepository historyRepository;
    private final ServiceRepository serviceRepository;
    private final CounterRepository counterRepository;

    public QueueEngineService(
            QueueTicketRepository ticketRepository,
            QueueStatusHistoryRepository historyRepository,
            ServiceRepository serviceRepository,
            CounterRepository counterRepository) {
        this.ticketRepository = ticketRepository;
        this.historyRepository = historyRepository;
        this.serviceRepository = serviceRepository;
        this.counterRepository = counterRepository;
    }

    @Transactional
    public QueueTicket bookTicket(Long citizenId, Long serviceId, Long officeId) {
        LocalDate today = LocalDate.now();

        // 1. Guard against double-booking active ticket
        List<QueueTicket> existingActive = ticketRepository.findByCitizenIdAndStatusIn(
                citizenId, List.of("WAITING", "CALLED", "SERVING")
        );
        if (!existingActive.isEmpty()) {
            throw new IllegalStateException("Citizen already has an active queue ticket (" +
                    existingActive.get(0).getTokenNumber() + "). Complete or cancel it first.");
        }

        // 2. Fetch service metadata for prefix
        ServiceEntity sEntity = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid service ID: " + serviceId));

        // 3. Deterministic sequence calculation
        Integer maxSeq = ticketRepository.findMaxSequenceNumber(officeId, serviceId, today);
        int nextSeq = (maxSeq == null) ? 1 : maxSeq + 1;

        String formattedToken = String.format("%s%03d", sEntity.getServicePrefix(), nextSeq);

        QueueTicket ticket = new QueueTicket();
        ticket.setCitizenId(citizenId);
        ticket.setServiceId(serviceId);
        ticket.setOfficeId(officeId);
        ticket.setTokenNumber(formattedToken);
        ticket.setSequenceNumber(nextSeq);
        ticket.setBookingDate(today);
        ticket.setStatus("WAITING");
        ticket.setBookedAt(OffsetDateTime.now());

        QueueTicket saved = ticketRepository.save(ticket);

        // Record Audit History
        recordHistory(saved.getTicketId(), null, "WAITING", "Citizen (Self)", "Virtual ticket self-booked via DQMS");

        return saved;
    }

    public Map<String, Object> getTicketTelemetry(Long ticketId) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketId));

        ServiceEntity sEntity = serviceRepository.findById(ticket.getServiceId()).orElse(null);
        int avgMins = (sEntity != null) ? sEntity.getAverageServiceMinutes() : 4;

        // Calculate active counters for this office
        List<Counter> activeCounters = counterRepository.findByOfficeIdAndStatus(ticket.getOfficeId(), "OPEN");
        int counterCount = Math.max(1, activeCounters.size());

        // Count people ahead
        long peopleAhead = ticketRepository.countPeopleAhead(
                ticket.getOfficeId(), ticket.getServiceId(), ticket.getBookingDate(), ticket.getSequenceNumber()
        );

        // Current serving token
        Optional<QueueTicket> currentServing = ticketRepository.findFirstByOfficeIdAndServiceIdAndStatusAndBookingDate(
                ticket.getOfficeId(), ticket.getServiceId(), "SERVING", ticket.getBookingDate()
        );
        String servingToken = currentServing.map(QueueTicket::getTokenNumber).orElse("None");

        // Wait calculation
        int estimatedWait = (ticket.getStatus().equals("CALLED") || ticket.getStatus().equals("SERVING"))
                ? 0
                : (int) Math.ceil((peopleAhead * avgMins) / (double) counterCount);

        Map<String, Object> response = new HashMap<>();
        response.put("ticket", ticket);
        response.put("peopleAhead", peopleAhead);
        response.put("currentServingToken", servingToken);
        response.put("estimatedWaitMinutes", estimatedWait);
        response.put("activeCounters", counterCount);

        return response;
    }

    @Transactional
    public QueueTicket callNextTicket(Official official, Long counterId) {
        LocalDate today = LocalDate.now();
        List<QueueTicket> waitingTickets = ticketRepository.findByOfficeIdAndStatusAndBookingDateOrderBySequenceNumberAsc(
                official.getOfficeId(), "WAITING", today
        );

        if (waitingTickets.isEmpty()) {
            throw new NoSuchElementException("No waiting citizens in queue for office " + official.getOfficeId());
        }

        QueueTicket nextTicket = waitingTickets.get(0);
        String oldStatus = nextTicket.getStatus();
        nextTicket.setStatus("CALLED");
        nextTicket.setCalledAt(OffsetDateTime.now());
        nextTicket.setCounterId(counterId);

        QueueTicket saved = ticketRepository.save(nextTicket);

        // Update counter state
        if (counterId != null) {
            counterRepository.findById(counterId).ifPresent(c -> {
                c.setCurrentServingTicketId(saved.getTicketId());
                c.setStatus("OPEN");
                counterRepository.save(c);
            });
        }

        recordHistory(saved.getTicketId(), oldStatus, "CALLED", official.getName(), "Called to desk counter");
        return saved;
    }

    @Transactional
    public QueueTicket startServing(Long ticketId, Official official) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("SERVING");
        ticket.setServingAt(OffsetDateTime.now());

        QueueTicket saved = ticketRepository.save(ticket);
        recordHistory(saved.getTicketId(), oldStatus, "SERVING", official.getName(), "Citizen verified at counter, processing begun");
        return saved;
    }

    @Transactional
    public QueueTicket completeTicket(Long ticketId, Official official, String remarks) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("COMPLETED");
        ticket.setCompletedAt(OffsetDateTime.now());

        // Free counter
        if (ticket.getCounterId() != null) {
            counterRepository.findById(ticket.getCounterId()).ifPresent(c -> {
                c.setCurrentServingTicketId(null);
                counterRepository.save(c);
            });
        }

        QueueTicket saved = ticketRepository.save(ticket);
        recordHistory(saved.getTicketId(), oldStatus, "COMPLETED", official.getName(), remarks);
        return saved;
    }

    @Transactional
    public QueueTicket markNoShow(Long ticketId, Official official) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("NO_SHOW");

        if (ticket.getCounterId() != null) {
            counterRepository.findById(ticket.getCounterId()).ifPresent(c -> {
                c.setCurrentServingTicketId(null);
                counterRepository.save(c);
            });
        }

        QueueTicket saved = ticketRepository.save(ticket);
        recordHistory(saved.getTicketId(), oldStatus, "NO_SHOW", official.getName(), "Citizen did not appear when called");
        return saved;
    }

    @Transactional
    public QueueTicket putOnHold(Long ticketId, Official official, String reason) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        String oldStatus = ticket.getStatus();
        ticket.setStatus("HOLD");

        QueueTicket saved = ticketRepository.save(ticket);
        recordHistory(saved.getTicketId(), oldStatus, "HOLD", official.getName(), reason);
        return saved;
    }

    @Transactional
    public QueueTicket cancelTicket(Long ticketId, Long citizenId) {
        QueueTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        if (!ticket.getCitizenId().equals(citizenId)) {
            throw new SecurityException("Unauthorized to cancel this ticket");
        }

        if (ticket.getStatus().equals("COMPLETED") || ticket.getStatus().equals("CANCELLED")) {
            throw new IllegalStateException("Cannot cancel ticket with status " + ticket.getStatus());
        }

        String oldStatus = ticket.getStatus();
        ticket.setStatus("CANCELLED");
        ticket.setCancelledAt(OffsetDateTime.now());

        QueueTicket saved = ticketRepository.save(ticket);
        recordHistory(saved.getTicketId(), oldStatus, "CANCELLED", "Citizen", "Self-initiated cancellation");
        return saved;
    }

    private void recordHistory(Long ticketId, String oldStatus, String newStatus, String changedBy, String remarks) {
        QueueStatusHistory history = new QueueStatusHistory(ticketId, oldStatus, newStatus, changedBy, remarks);
        historyRepository.save(history);
    }
}
