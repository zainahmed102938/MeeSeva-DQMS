package gov.telangana.meeseva.dqms.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "COUNTER")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "counter_id")
    private Long counterId;

    @Column(name = "office_id", nullable = false)
    private Long officeId;

    @Column(name = "counter_number", nullable = false, length = 50)
    private String counterNumber;

    @Column(name = "current_serving_ticket_id")
    private Long currentServingTicketId;

    @Column(name = "status", length = 20)
    private String status = "OPEN"; // OPEN, BUSY, CLOSED, PAUSED

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public Counter() {}

    public Long getCounterId() { return counterId; }
    public void setCounterId(Long counterId) { this.counterId = counterId; }

    public Long getOfficeId() { return officeId; }
    public void setOfficeId(Long officeId) { this.officeId = officeId; }

    public String getCounterNumber() { return counterNumber; }
    public void setCounterNumber(String counterNumber) { this.counterNumber = counterNumber; }

    public Long getCurrentServingTicketId() { return currentServingTicketId; }
    public void setCurrentServingTicketId(Long currentServingTicketId) { this.currentServingTicketId = currentServingTicketId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
