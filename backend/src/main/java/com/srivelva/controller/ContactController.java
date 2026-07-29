package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.service.WhatsAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ContactController — handles enquiries from the Contact page.
 *
 * POST /api/contact  — full contact form submission
 * POST /api/contact/quick — one-click quick message buttons
 *
 * No WhatsApp logic lives in the frontend. This controller receives the
 * form data and delegates to WhatsAppService, which sends the message to
 * the admin (real Twilio or mock console log).
 */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final WhatsAppService whatsAppService;

    public ContactController(WhatsAppService whatsAppService) {
        this.whatsAppService = whatsAppService;
    }

    /**
     * POST /api/contact
     *
     * Body (all strings, only name + message required):
     * {
     *   "name":    "Priya Sharma",
     *   "phone":   "9876543210",
     *   "email":   "priya@example.com",
     *   "subject": "Bulk Order",
     *   "message": "I need 50 bottles of sesame oil."
     * }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitContact(
            @RequestBody Map<String, String> body) {

        String name    = trim(body.get("name"));
        String phone   = trim(body.get("phone"));
        String email   = trim(body.get("email"));
        String subject = trim(body.get("subject"));
        String message = trim(body.get("message"));

        if (name.isEmpty() || message.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Name and message are required."));
        }

        String adminMessage = String.format(
            "📩 *New Customer Enquiry*%n%n"   +
            "Name    : %s%n"                  +
            "Phone   : %s%n"                  +
            "Email   : %s%n"                  +
            "Subject : %s%n%n"                +
            "Message :%n%s",
            name,
            phone.isEmpty()   ? "Not provided" : phone,
            email.isEmpty()   ? "Not provided" : email,
            subject.isEmpty() ? "General"       : subject,
            message
        );

        whatsAppService.notifyAdmin(adminMessage);

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully"));
    }

    /**
     * POST /api/contact/quick
     *
     * Body: { "label": "I want to place a bulk order", "name": "Priya" }
     * name is optional — used to personalise the message if provided.
     */
    @PostMapping("/quick")
    public ResponseEntity<ApiResponse<Void>> submitQuick(
            @RequestBody Map<String, String> body) {

        String label = trim(body.get("label"));
        String name  = trim(body.get("name"));

        if (label.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("label is required."));
        }

        String adminMessage = String.format(
            "💬 *Quick Message from Website*%n%n" +
            "From    : %s%n"                      +
            "Message : %s",
            name.isEmpty() ? "Anonymous visitor" : name,
            label
        );

        whatsAppService.notifyAdmin(adminMessage);

        return ResponseEntity.ok(ApiResponse.success("Message sent successfully"));
    }

    private String trim(String s) {
        return s == null ? "" : s.trim();
    }
}
