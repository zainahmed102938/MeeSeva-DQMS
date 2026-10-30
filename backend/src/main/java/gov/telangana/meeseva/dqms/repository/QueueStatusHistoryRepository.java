package gov.telangana.meeseva.dqms.repository;

import gov.telangana.meeseva.dqms.model.QueueStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueStatusHistoryRepository extends JpaRepository<QueueStatusHistory, Long> {
    List<QueueStatusHistory> findByTicketIdOrderByChangedAtAsc(Long ticketId);
}
