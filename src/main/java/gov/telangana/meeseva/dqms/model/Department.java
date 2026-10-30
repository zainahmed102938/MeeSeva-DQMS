package gov.telangana.meeseva.dqms.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "DEPARTMENT")
public class Department {

    @Id
    @Column(name = "department_id", length = 20)
    private String departmentId;

    @Column(name = "department_name", nullable = false, length = 150)
    private String departmentName;

    @Column(name = "telugu_name", length = 255)
    private String teluguName;

    @Column(name = "prefix", nullable = false, length = 10)
    private String prefix;

    @Column(name = "default_counter_name", length = 100)
    private String defaultCounterName;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Department() {}

    public Department(String departmentId, String departmentName, String prefix, String defaultCounterName) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.prefix = prefix;
        this.defaultCounterName = defaultCounterName;
    }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getTeluguName() { return teluguName; }
    public void setTeluguName(String teluguName) { this.teluguName = teluguName; }

    public String getPrefix() { return prefix; }
    public void setPrefix(String prefix) { this.prefix = prefix; }

    public String getDefaultCounterName() { return defaultCounterName; }
    public void setDefaultCounterName(String defaultCounterName) { this.defaultCounterName = defaultCounterName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
