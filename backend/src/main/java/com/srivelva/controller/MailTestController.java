package com.srivelva.controller;

import com.srivelva.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * MailTestController — standalone SMTP verification endpoint.
 *
 * USE BEFORE going live to confirm your Gmail App Password works.
 *
 * Test with curl (replace the email):
 *   curl -X POST http://localhost:8080/api/test-mail \
 *        -H "Content-Type: application/json" \
 *        -d '{"to":"yourcustomer@gmail.com"}'
 *
 * Or open in browser (GET version):
 *   http://localhost:8080/api/test-mail?to=yourcustomer@gmail.com
 *
 * SUCCESS → HTTP 200 + "Email sent to: ..." in response + email in inbox
 * FAILURE → HTTP 500 + error details in response + full log in console
 *
 * Check the Spring Boot console for lines starting with [Email] to see
 * exactly what happened.
 */
@RestController
@RequestMapping("/api/test-mail")
public class MailTestController {

    private final EmailService emailService;

    public MailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * POST /api/test-mail
     * Body: { "to": "customer@gmail.com" }
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> testMailPost(
            @RequestBody Map<String, String> body) {

        String to = body.getOrDefault("to", "").trim();
        return runTest(to);
    }

    /**
     * GET /api/test-mail?to=customer@gmail.com
     * Useful for quick browser testing.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> testMailGet(
            @RequestParam(defaultValue = "") String to) {

        return runTest(to.trim());
    }

    private ResponseEntity<Map<String, String>> runTest(String to) {
        if (to.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status",  "error",
                "message", "Provide a recipient: POST body {\"to\":\"email\"} or GET ?to=email",
                "hint",    "Example: curl -X POST http://localhost:8080/api/test-mail "
                         + "-H 'Content-Type: application/json' -d '{\"to\":\"you@gmail.com\"}'"
            ));
        }

        System.out.println("[MailTest] ► Test email triggered — sending to: " + to);

        try {
            emailService.sendTestEmail(to);

            System.out.println("[MailTest] ✓ sendTestEmail completed without exception for: " + to);
            return ResponseEntity.ok(Map.of(
                "status",  "sent",
                "message", "Email dispatched to: " + to,
                "next",    "Check inbox (and spam folder). "
                         + "Also check Spring Boot console for [Email] lines."
            ));

        } catch (Exception e) {
            System.err.println("[MailTest] ✗ sendTestEmail threw: " + e.getMessage());
            e.printStackTrace(System.err);
            return ResponseEntity.status(500).body(Map.of(
                "status",  "error",
                "message", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName(),
                "hint",    "Check console for full stack trace and [Email] log lines"
            ));
        }
    }
}
