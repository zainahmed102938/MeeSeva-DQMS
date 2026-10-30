package gov.telangana.meeseva.dqms.repository;

import gov.telangana.meeseva.dqms.model.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, String> {
    List<District> findByStatusOrderByDistrictNameAsc(String status);
}
