package gov.telangana.meeseva.dqms.controller;

import gov.telangana.meeseva.dqms.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/otp/request")
    public ResponseEntity<Map<String, Object>> requestOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String userType = body.getOrDefault("userType", "CITIZEN");
        return ResponseEntity.ok(authService.requestOtp(identifier, userType));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String otpCode = body.get("otpCode");
        String userType = body.getOrDefault("userType", "CITIZEN");
        return ResponseEntity.ok(authService.verifyOtp(identifier, otpCode, userType));
    }
}
