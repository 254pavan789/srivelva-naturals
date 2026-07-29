package com.srivelva.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Payment via Razorpay removed.
 * All payments are handled via QR/UPI on the checkout page.
 */
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder() {
        return ResponseEntity.status(410).body("Razorpay removed. Use UPI/QR payment.");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment() {
        return ResponseEntity.status(410).body("Razorpay removed. Use UPI/QR payment.");
    }
}
