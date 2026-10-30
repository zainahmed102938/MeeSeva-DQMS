package gov.telangana.meeseva.dqms.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "OFFICIAL")
public class Official {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "official_id")
    private Long officialId;

    @Column(name = "email", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "department_id", length = 20)
    private String departmentId;

    @Column(name = "district_id", length = 10)
    private String districtId;

    @Column(name = "office_id")
    private Long officeId;

    @Column(name = "role", length = 50)
    private String role = "OFFICER"; // OFFICER, SUPERVISOR, ADMIN

    @Column(name = "assigned_counter_id")
    private Long assignedCounterId;

    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "last_login")
    private OffsetDateTime lastLogin;

    public Official() {}

    public Long getOfficialId() { return officialId; }
    public void setOfficialId(Long officialId) { this.officialId = officialId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getDistrictId() { return districtId; }
    public void setDistrictId(String districtId) { this.districtId = districtId; }

    public Long getOfficeId() { return officeId; }
    public void setOfficeId(Long officeId) { this.officeId = officeId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getAssignedCounterId() { return assignedCounterId; }
    public void setAssignedCounterId(Long assignedCounterId) { this.assignedCounterId = assignedCounterId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(OffsetDateTime lastLogin) { this.lastLogin = lastLogin; }
}
