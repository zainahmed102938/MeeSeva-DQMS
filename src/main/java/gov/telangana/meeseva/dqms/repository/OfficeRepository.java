package gov.telangana.meeseva.dqms.repository;

import gov.telangana.meeseva.dqms.model.Office;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {
    List<Office> findByDistrictIdAndDepartmentIdAndStatusOrderByOfficeNameAsc(String districtId, String departmentId, String status);
}
