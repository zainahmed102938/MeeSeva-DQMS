package gov.telangana.meeseva.dqms.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "SERVICE")
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "department_id", nullable = false, length = 20)
    private String departmentId;

    @Column(name = "service_name", nullable = false, length = 150)
    private String serviceName;

    @Column(name = "service_prefix", nullable = false, length = 10)
    private String servicePrefix;

    @Column(name = "average_service_minutes", nullable = false)
    private Integer averageServiceMinutes = 5;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public ServiceEntity() {}

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServicePrefix() { return servicePrefix; }
    public void setServicePrefix(String servicePrefix) { this.servicePrefix = servicePrefix; }

    public Integer getAverageServiceMinutes() { return averageServiceMinutes; }
    public void setAverageServiceMinutes(Integer averageServiceMinutes) { this.averageServiceMinutes = averageServiceMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
