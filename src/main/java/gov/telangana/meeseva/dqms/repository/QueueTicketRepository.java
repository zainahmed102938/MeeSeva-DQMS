package gov.telangana.meeseva.dqms.repository;

import gov.telangana.meeseva.dqms.model.QueueTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTicketRepository extends JpaRepository<QueueTicket, Long> {

    List<QueueTicket> findByCitizenIdAndStatusIn(Long citizenId, List<String> statuses);

    List<QueueTicket> findByOfficeIdAndBookingDateOrderBySequenceNumberDesc(Long officeId, LocalDate bookingDate);

    List<QueueTicket> findByOfficeIdAndStatusAndBookingDateOrderBySequenceNumberAsc(Long officeId, String status, LocalDate bookingDate);

    @Query("SELECT MAX(t.sequenceNumber) FROM QueueTicket t WHERE t.officeId = :officeId AND t.serviceId = :serviceId AND t.bookingDate = :bookingDate")
    Integer findMaxSequenceNumber(@Param("officeId") Long officeId, @Param("serviceId") Long serviceId, @Param("bookingDate") LocalDate bookingDate);

    @Query("SELECT COUNT(t) FROM QueueTicket t WHERE t.officeId = :officeId AND t.serviceId = :serviceId AND t.bookingDate = :bookingDate AND t.status = 'WAITING' AND t.sequenceNumber < :sequenceNumber")
    Long countPeopleAhead(@Param("officeId") Long officeId, @Param("serviceId") Long serviceId, @Param("bookingDate") LocalDate bookingDate, @Param("sequenceNumber") Integer sequenceNumber);

    Optional<QueueTicket> findFirstByOfficeIdAndServiceIdAndStatusAndBookingDate(Long officeId, Long serviceId, String status, LocalDate bookingDate);
}
