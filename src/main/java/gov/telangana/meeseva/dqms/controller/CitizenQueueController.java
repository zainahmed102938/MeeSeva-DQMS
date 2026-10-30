package gov.telangana.meeseva.dqms.controller;

import gov.telangana.meeseva.dqms.model.QueueTicket;
import gov.telangana.meeseva.dqms.repository.QueueTicketRepository;
import gov.telangana.meeseva.dqms.service.QueueEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citizen/ticket")
@CrossOrigin(origins = "*")
public class CitizenQueueController {

    private final QueueEngineService queueEngineService;
    private final QueueTicketRepository ticketRepository;

    public CitizenQueueController(QueueEngineService queueEngineService, QueueTicketRepository ticketRepository) {
        this.queueEngineService = queueEngineService;
        this.ticketRepository = ticketRepository;
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookTicket(@RequestBody Map<String, Object> body) {
        Long citizenId = Long.valueOf(body.get("citizenId").toString());
        Long serviceId = Long.valueOf(body.get("serviceId").toString());
        Long officeId = Long.valueOf(body.get("officeId").toString());

        QueueTicket ticket = queueEngineService.bookTicket(citizenId, serviceId, officeId);
        return ResponseEntity.ok(queueEngineService.getTicketTelemetry(ticket.getTicketId()));
    }

    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveTicket(@RequestParam Long citizenId) {
        List<QueueTicket> active = ticketRepository.findByCitizenIdAndStatusIn(
                citizenId, List.of("WAITING", "CALLED", "SERVING")
        );
        if (active.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(queueEngineService.getTicketTelemetry(active.get(0).getTicketId()));
    }

    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<QueueTicket> cancelTicket(
            @PathVariable Long ticketId,
            @RequestParam Long citizenId) {
        return ResponseEntity.ok(queueEngineService.cancelTicket(ticketId, citizenId));
    }
}
