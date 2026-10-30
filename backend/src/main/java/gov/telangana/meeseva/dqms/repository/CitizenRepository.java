package gov.telangana.meeseva.dqms.repository;

import gov.telangana.meeseva.dqms.model.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, Long> {
    Optional<Citizen> findByMobileNumber(String mobileNumber);
}
