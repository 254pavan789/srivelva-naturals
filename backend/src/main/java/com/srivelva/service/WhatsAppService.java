package com.srivelva.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * WhatsAppService — backend-only WhatsApp notification layer.
 *
 * TWO RECIPIENTS:
 *   Admin   — notified on every new order and on every confirmation.
 *   Customer — notified when admin confirms their order (confirmation SMS).
 *
 * MOCK MODE (default — no Twilio account needed):
 *   When TWILIO_ACCOUNT_SID = "mock", messages are printed to the Spring Boot
 *   console. The full order + confirm flow works with zero external setup.
 *
 * REAL MODE (Twilio):
 *   export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   export TWILIO_AUTH_TOKEN=your_token
 *   export TWILIO_FROM_NUMBER=whatsapp:+14155238886
 *   export TWILIO_ADMIN_PHONE=whatsapp:+919944268288
 *   Restart backend — messages will be delivered via Twilio WhatsApp API.
 *
 * FAILURE SAFETY:
 *   All send paths catch every exception internally. A notification failure
 *   must NEVER propagate and roll back the order transaction.
 */
@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);
    private static final String MOCK = "mock";

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    /** Approved Twilio WhatsApp sender (sandbox or business number). */
    @Value("${twilio.from-number}")
    private String fromNumber;

    /** Admin's WhatsApp number — receives ALL notifications. */
    @Value("${twilio.admin-phone}")
    private String adminPhone;

    private volatile boolean twilioReady = false;

    // ══════════════════════════════════════════════════════════════
    // Public API — called only from OrderService (never from frontend)
    // ══════════════════════════════════════════════════════════════

    /**
     * NEW ORDER — notifies ADMIN.
     * Called by OrderService.createOrder() after DB save.
     *
     * Message to admin:
     *   "🛒 New Order Received!
     *    Order ID: 42
     *    Customer: Priya Sharma
     *    Total: ₹599.00
     *    Please confirm in the admin panel."
     */
    /**
     * General-purpose admin notification used by ContactController.
     * The caller formats the full message body.
     */
    public void notifyAdmin(String messageBody) {
        sendToAdmin(messageBody);
    }

    public void notifyAdminNewOrder(Long orderId, String customerName,
                                    String customerPhone, Double totalAmount) {
        String body = String.format(
            "🛒 *New Order Received!*%n%n" +
            "Order ID   : #%d%n" +
            "Customer   : %s%n" +
            "Phone      : %s%n" +
            "Total      : ₹%.2f%n%n" +
            "Please log in to the admin panel to confirm this order.",
            orderId, customerName, customerPhone, totalAmount
        );
        sendToAdmin(body);
    }

    /**
     * ORDER CONFIRMED — notifies both ADMIN and CUSTOMER.
     * Called by OrderService.confirmOrder() after status → CONFIRMED.
     *
     * Message to admin:
     *   "✅ Order #42 Confirmed — admin log"
     *
     * Message to customer:
     *   "✅ Your order #42 is confirmed! Delivery in 3–5 days."
     *
     * @param customerPhone raw 10-digit Indian number, e.g. "9876543210"
     *                      Converted to E.164 format for Twilio internally.
     */
    public void notifyOrderConfirmed(Long orderId, String customerName,
                                     String customerPhone, Double totalAmount) {
        // 1. Admin confirmation log
        String adminBody = String.format(
            "✅ *Order Confirmed!*%n%n" +
            "Order ID : #%d%n" +
            "Customer : %s (%s)%n" +
            "Total    : ₹%.2f%n%n" +
            "Status has been updated to CONFIRMED.",
            orderId, customerName, customerPhone, totalAmount
        );
        sendToAdmin(adminBody);

        // 2. Customer confirmation — only if we have their number
        if (customerPhone != null && !customerPhone.isBlank()) {
            String customerBody = String.format(
                "✅ *Your Order is Confirmed!*%n%n" +
                "Hi %s,%n%n" +
                "Your order *#%d* from Sri Velva Naturals has been confirmed.%n" +
                "Expected delivery: 3–5 business days.%n%n" +
                "Thank you for shopping with us! 🌿",
                customerName, orderId
            );
            sendToCustomer(customerPhone, customerBody);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // Internal — routing between admin and customer
    // ══════════════════════════════════════════════════════════════

    /** Sends to the configured admin WhatsApp number. */
    private void sendToAdmin(String body) {
        if (isMock()) { logMock("ADMIN (" + adminPhone + ")", body); return; }
        doSend(adminPhone, body);
    }

    /**
     * Sends to the customer's number.
     * Converts a 10-digit Indian mobile into E.164 WhatsApp format:
     *   "9876543210" → "whatsapp:+919876543210"
     */
    private void sendToCustomer(String rawPhone, String body) {
        String e164 = toWhatsAppFormat(rawPhone);
        if (e164 == null) {
            log.warn("[WhatsApp] Could not parse customer phone '{}' — skipping.", rawPhone);
            return;
        }
        if (isMock()) { logMock("CUSTOMER (" + e164 + ")", body); return; }
        doSend(e164, body);
    }

    // ══════════════════════════════════════════════════════════════
    // Internal — Twilio / mock
    // ══════════════════════════════════════════════════════════════

    private void doSend(String toNumber, String body) {
        try {
            ensureTwilioReady();
            Message msg = Message.creator(
                new PhoneNumber(toNumber),
                new PhoneNumber(fromNumber),
                body
            ).create();
            log.info("[WhatsApp] Sent to {}. SID={} status={}", toNumber, msg.getSid(), msg.getStatus());
        } catch (Exception e) {
            log.error("[WhatsApp] Failed to send to {}: {}", toNumber, e.getMessage(), e);
        }
    }

    private void logMock(String recipient, String body) {
        log.info("╔══════════════════════════════════════════════════════");
        log.info("║ [WhatsApp MOCK] To: {}", recipient);
        log.info("║ Message:");
        for (String line : body.split("\n")) log.info("║   {}", line);
        log.info("╚══════════════════════════════════════════════════════");
        log.info("  ↳ Set TWILIO_* env vars to send real WhatsApp messages.");
    }

    private boolean isMock() {
        return accountSid == null || accountSid.isBlank()
               || MOCK.equalsIgnoreCase(accountSid.trim());
    }

    private void ensureTwilioReady() {
        if (!twilioReady) {
            synchronized (this) {
                if (!twilioReady) {
                    Twilio.init(accountSid, authToken);
                    twilioReady = true;
                    log.info("[WhatsApp] Twilio initialised (sid={}...)", accountSid.substring(0, 8));
                }
            }
        }
    }

    /**
     * Normalises a customer phone number to Twilio WhatsApp format.
     * Handles: "9876543210", "+919876543210", "919876543210"
     * Returns null if the number cannot be parsed safely.
     */
    private String toWhatsAppFormat(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("[^\\d]", "");
        if (digits.length() == 10) return "whatsapp:+91" + digits;            // 10-digit Indian
        if (digits.length() == 12 && digits.startsWith("91")) return "whatsapp:+" + digits;  // 91XXXXXXXXXX
        if (digits.length() == 13 && digits.startsWith("091")) return "whatsapp:+" + digits.substring(1);
        if (raw.startsWith("+")) return "whatsapp:" + raw;                     // already E.164
        return null;
    }
}
