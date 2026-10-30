package gov.telangana.meeseva.dqms.service;

import gov.telangana.meeseva.dqms.model.Citizen;
import gov.telangana.meeseva.dqms.model.Official;
import gov.telangana.meeseva.dqms.repository.CitizenRepository;
import gov.telangana.meeseva.dqms.repository.OfficialRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.OffsetDateTime;
import java.util.*;

@Service
public class AuthService {

    private final CitizenRepository citizenRepository;
    private final OfficialRepository officialRepository;
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthService(CitizenRepository citizenRepository, OfficialRepository officialRepository) {
        this.citizenRepository = citizenRepository;
        this.officialRepository = officialRepository;
    }

    public Map<String, Object> requestOtp(String identifier, String userType) {
        // Dev sandbox mock code is 123456
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("identifier", identifier);
        res.put("userType", userType);
        res.put("message", "OTP sent successfully to " + identifier + ". (Dev Sandbox Code: 123456)");
        return res;
    }

    public Map<String, Object> verifyOtp(String identifier, String otpCode, String userType) {
        if (!"123456".equals(otpCode)) {
            throw new IllegalArgumentException("Invalid OTP code. Please enter the valid 6-digit code (e.g. 123456).");
        }

        Map<String, Object> result = new HashMap<>();

        if ("CITIZEN".equalsIgnoreCase(userType)) {
            Citizen citizen = citizenRepository.findByMobileNumber(identifier)
                    .orElseGet(() -> {
                        Citizen newCit = new Citizen();
                        newCit.setMobileNumber(identifier);
                        newCit.setName("Citizen " + identifier.substring(Math.max(0, identifier.length() - 4)));
                        newCit.setCreatedAt(OffsetDateTime.now());
                        return citizenRepository.save(newCit);
                    });

            citizen.setLastLogin(OffsetDateTime.now());
            citizenRepository.save(citizen);

            String token = generateJwt(citizen.getMobileNumber(), "ROLE_CITIZEN", Map.of("citizenId", citizen.getCitizenId()));
            result.put("type", "CITIZEN");
            result.put("profile", citizen);
            result.put("token", token);
        } else {
            // Official Profile: Strictly server-determined!
            Official official = officialRepository.findByEmail(identifier.trim().toLowerCase())
                    .orElseThrow(() -> new SecurityException("Unauthorized Official Email: " + identifier + ". Must be registered in official roster."));

            official.setLastLogin(OffsetDateTime.now());
            officialRepository.save(official);

            Map<String, Object> claims = new HashMap<>();
            claims.put("officialId", official.getOfficialId());
            claims.put("departmentId", official.getDepartmentId());
            claims.put("districtId", official.getDistrictId());
            claims.put("officeId", official.getOfficeId());
            claims.put("role", official.getRole());

            String token = generateJwt(official.getEmail(), "ROLE_OFFICIAL", claims);
            result.put("type", "OFFICIAL");
            result.put("profile", official);
            result.put("token", token);
        }

        return result;
    }

    private String generateJwt(String subject, String role, Map<String, Object> additionalClaims) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .claims(additionalClaims)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }
}
