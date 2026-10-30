package gov.telangana.meeseva.dqms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AIService {

    @Value("${freellmapi.base-url:http://localhost:8000/v1}")
    private String freellmApiUrl;

    @Value("${freellmapi.api-key:}")
    private String freellmApiKey;

    @Value("${freellmapi.model:auto:free}")
    private String defaultModel;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> askMeeSevaAssistant(String prompt, String userType) {
        String systemInstruction = "You are MeeSeva Digital Sahayak, the official AI assistant for the Government of Telangana Digital Queue Management System (DQMS)."
                + " Assist citizens and officials across all 33 Telangana districts with clear document checklists and queue guidance.";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (freellmApiKey != null && !freellmApiKey.isBlank()) {
                headers.setBearerAuth(freellmApiKey);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", defaultModel);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemInstruction),
                    Map.of("role", "user", "content", prompt)
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(freellmApiUrl + "/chat/completions", entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List choices = (List) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map msg = (Map) firstChoice.get("message");
                    return Map.of(
                            "text", msg.get("content"),
                            "model", body.getOrDefault("model", defaultModel)
                    );
                }
            }
        } catch (Exception e) {
            // Graceful fallback to embedded expert knowledge
        }

        return Map.of(
                "text", generateFallbackAnswer(prompt),
                "model", "meeseva-knowledge-base (embedded)"
        );
    }

    private String generateFallbackAnswer(String prompt) {
        String p = prompt.toLowerCase();
        if (p.contains("income")) {
            return "### Income Certificate Requirements (Telangana MeeSeva):\n" +
                    "1. Application Form signed by applicant\n" +
                    "2. Ration Card / Food Security Card or Aadhaar Card\n" +
                    "3. Salary Certificate (if employed) or Income Affidavit\n" +
                    "4. Electricity bill / Residence proof\n" +
                    "5. Processing Fee: ₹45 | Standard Delivery Time: 7 working days.";
        } else if (p.contains("caste") || p.contains("community")) {
            return "### Integrated Caste Certificate Requirements:\n" +
                    "1. Duly filled Caste Application Form\n" +
                    "2. Aadhaar Card copy\n" +
                    "3. School Leaving Certificate (TC) or Father's TC showing caste\n" +
                    "4. 1954/1956 genealogical proof or sibling's caste certificate\n" +
                    "5. Standard SLA: 15–30 working days.";
        } else if (p.contains("driving") || p.contains("llr") || p.contains("rta")) {
            return "### RTA Driving License / LLR Slot Booking:\n" +
                    "1. Age proof (SSC Certificate / Aadhaar / Passport)\n" +
                    "2. Form 1 (Self Physical Fitness) & Form 1A (Medical if aged >40)\n" +
                    "3. Address proof within district jurisdiction\n" +
                    "4. Arrive 15 minutes before your virtual queue token slot at the designated RTO Testing Track.";
        }
        return "Thank you for consulting MeeSeva Digital Sahayak. All 33 Telangana district centers are operational Monday through Saturday from 9:30 AM to 6:00 PM. Please have your original Aadhaar and photocopies ready when your virtual token is called.";
    }
}
