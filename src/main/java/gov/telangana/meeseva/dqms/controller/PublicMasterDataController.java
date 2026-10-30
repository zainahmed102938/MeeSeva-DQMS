package gov.telangana.meeseva.dqms.controller;

import gov.telangana.meeseva.dqms.model.*;
import gov.telangana.meeseva.dqms.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicMasterDataController {

    private final DistrictRepository districtRepository;
    private final DepartmentRepository departmentRepository;
    private final ServiceRepository serviceRepository;
    private final OfficeRepository officeRepository;

    public PublicMasterDataController(
            DistrictRepository districtRepository,
            DepartmentRepository departmentRepository,
            ServiceRepository serviceRepository,
            OfficeRepository officeRepository) {
        this.districtRepository = districtRepository;
        this.departmentRepository = departmentRepository;
        this.serviceRepository = serviceRepository;
        this.officeRepository = officeRepository;
    }

    @GetMapping("/districts")
    public List<District> getAllDistricts() {
        return districtRepository.findByStatusOrderByDistrictNameAsc("ACTIVE");
    }

    @GetMapping("/departments")
    public List<Department> getAllDepartments() {
        return departmentRepository.findByStatusOrderByDepartmentNameAsc("ACTIVE");
    }

    @GetMapping("/services")
    public List<ServiceEntity> getServicesByDepartment(@RequestParam String departmentId) {
        return serviceRepository.findByDepartmentIdAndStatusOrderByServiceNameAsc(departmentId, "ACTIVE");
    }

    @GetMapping("/offices")
    public List<Office> getOffices(
            @RequestParam String districtId,
            @RequestParam String departmentId) {
        return officeRepository.findByDistrictIdAndDepartmentIdAndStatusOrderByOfficeNameAsc(districtId, departmentId, "ACTIVE");
    }
}
