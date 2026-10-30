package gov.telangana.meeseva.dqms.controller;

import gov.telangana.meeseva.dqms.model.Official;
import gov.telangana.meeseva.dqms.model.QueueTicket;
import gov.telangana.meeseva.dqms.repository.OfficialRepository;
import gov.telangana.meeseva.dqms.service.QueueEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/official")
@CrossOrigin(origins = "*")
public class OfficialQueueController {

    private final QueueEngineService queueEngineService;
    private final OfficialRepository officialRepository;

    public OfficialQueueController(QueueEngineService queueEngineService, OfficialRepository officialRepository) {
        this.queueEngineService = queueEngineService;
        this.officialRepository = officialRepository;
    }

    private Official getOfficialOrThrow(Long officialId) {
        return officialRepository.findById(officialId)
                .orElseThrow(() -> new NoSuchElementException("Official not found: " + officialId));
    }

    @PostMapping("/ticket/call-next")
    public ResponseEntity<QueueTicket> callNext(
            @RequestParam Long officialId,
            @RequestParam(required = false) Long counterId) {
        Official official = getOfficialOrThrow(officialId);
        return ResponseEntity.ok(queueEngineService.callNextTicket(official, counterId));
    }

    @PostMapping("/ticket/{ticketId}/start-serving")
    public ResponseEntity<QueueTicket> startServing(
            @PathVariable Long ticketId,
            @RequestParam Long officialId) {
        Official official = getOfficialOrThrow(officialId);
        return ResponseEntity.ok(queueEngineService.startServing(ticketId, official));
    }

    @PostMapping("/ticket/{ticketId}/complete")
    public ResponseEntity<QueueTicket> completeTicket(
            @PathVariable Long ticketId,
            @RequestParam Long officialId,
            @RequestParam(defaultValue = "Service processed successfully") String remarks) {
        Official official = getOfficialOrThrow(officialId);
        return ResponseEntity.ok(queueEngineService.completeTicket(ticketId, official, remarks));
    }

    @PostMapping("/ticket/{ticketId}/no-show")
    public ResponseEntity<QueueTicket> markNoShow(
            @PathVariable Long ticketId,
            @RequestParam Long officialId) {
        Official official = getOfficialOrThrow(officialId);
        return ResponseEntity.ok(queueEngineService.markNoShow(ticketId, official));
    }

    @PostMapping("/ticket/{ticketId}/hold")
    public ResponseEntity<QueueTicket> putOnHold(
            @PathVariable Long ticketId,
            @RequestParam Long officialId,
            @RequestParam(defaultValue = "Pending document review") String reason) {
        Official official = getOfficialOrThrow(officialId);
        return ResponseEntity.ok(queueEngineService.putOnHold(ticketId, official, reason));
    }
}
