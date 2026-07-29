package com.srivelva.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.mail.from-name:Sri Velva Naturals}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Runs once at startup — prints credential status to BOTH logger AND System.out
     * so it is always visible regardless of log-level configuration.
     */
    @PostConstruct
    public void reportStartupStatus() {
        boolean credsMissing = fromAddress == null
                || fromAddress.isBlank()
                || fromAddress.contains("your-gmail")
                || fromAddress.equals("your-gmail@gmail.com");

        if (credsMissing) {
            String msg =
                "\n╔══════════════════════════════════════════════════════════╗" +
                "\n║  EMAIL NOT CONFIGURED — emails will NOT be sent          ║" +
                "\n║                                                          ║" +
                "\n║  STEP 1: Open application.properties                     ║" +
                "\n║  STEP 2: Set spring.mail.username=you@gmail.com          ║" +
                "\n║  STEP 3: Set spring.mail.password=<16-char-app-password> ║" +
                "\n║  STEP 4: Restart the backend                             ║" +
                "\n║                                                          ║" +
                "\n║  App Password: myaccount.google.com/apppasswords         ║" +
                "\n╚══════════════════════════════════════════════════════════╝";
            System.out.println(msg);   // System.out — always visible
            log.warn(msg);
        } else {
            String msg = "\n[Email] CONFIGURED — from: " + fromAddress + " — emails WILL be sent";
            System.out.println(msg);
            log.info(msg);
        }
    }

    // ── Public API ────────────────────────────────────────────────

    /**
     * Called by OrderService after every status change.
     * Prints to System.out so it is visible even if SLF4J log level is WARN.
     */
    public void sendOrderStatusUpdate(String toEmail, String customerName,
                                      Long orderId, String newStatus) {

        // Always print to console — never silently skip
        System.out.println("[Email] ► sendOrderStatusUpdate called"
                + " | to=" + toEmail
                + " | orderId=" + orderId
                + " | status=" + newStatus);
        log.info("[Email] sendOrderStatusUpdate called | to={} | orderId={} | status={}",
                 toEmail, orderId, newStatus);

        if (toEmail == null || toEmail.isBlank()) {
            System.out.println("[Email] ✗ Skipping — customer email is empty for order #" + orderId);
            log.warn("[Email] Skipping — customer email is empty for order #{}", orderId);
            return;
        }

        doSend(toEmail, buildSubject(newStatus, orderId),
               buildHtmlBody(customerName, orderId, newStatus));
    }

    /**
     * Standalone test endpoint helper — called by MailTestController.
     * Sends a plain test email to verify SMTP config works.
     */
    public void sendTestEmail(String toEmail) {
        System.out.println("[Email] ► sendTestEmail called | to=" + toEmail);
        log.info("[Email] sendTestEmail called | to={}", toEmail);

        doSend(toEmail,
               "Test Email from Sri Velva Naturals",
               "<h2>Email is working!</h2>"
                 + "<p>If you received this, your SMTP configuration is correct.</p>"
                 + "<p><strong>From:</strong> " + fromAddress + "</p>");
    }

    // ── Core send ─────────────────────────────────────────────────

    private void doSend(String toEmail, String subject, String htmlBody) {
        System.out.println("[Email] Attempting send | from=" + fromAddress + " | to=" + toEmail
                         + " | subject=" + subject);
        log.info("[Email] Attempting send | from={} | to={} | subject={}", fromAddress, toEmail, subject);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);

            System.out.println("[Email] ✓ SUCCESS — sent to " + toEmail);
            log.info("[Email] SUCCESS — '{}' sent to {}", subject, toEmail);

        } catch (MailAuthenticationException e) {
            String err = "[Email] ✗ AUTHENTICATION FAILED\n"
                       + "  from            : " + fromAddress + "\n"
                       + "  raw error       : " + e.getMessage() + "\n"
                       + "  FIX: use a Gmail App Password (NOT your account password)\n"
                       + "  Get one at      : myaccount.google.com/apppasswords\n"
                       + "  Then set        : spring.mail.password=<16-char-code-no-spaces>\n"
                       + "  Restart backend after changing application.properties";
            System.err.println(err);
            log.error(err);

        } catch (MailSendException e) {
            String err = "[Email] ✗ SEND FAILED to " + toEmail + "\n"
                       + "  error: " + e.getMessage() + "\n"
                       + "  Causes: wrong port, firewall blocking 587, Gmail rate limit";
            System.err.println(err);
            log.error(err);
            // Print nested cause for full diagnosis
            if (e.getCause() != null) {
                System.err.println("[Email]   root cause: " + e.getCause().getMessage());
                log.error("[Email]   root cause: {}", e.getCause().getMessage());
            }

        } catch (Exception e) {
            System.err.println("[Email] ✗ UNEXPECTED ERROR sending to " + toEmail
                             + " | " + e.getClass().getSimpleName() + ": " + e.getMessage());
            log.error("[Email] Unexpected error sending to {}: {}", toEmail, e.getMessage(), e);
            e.printStackTrace(System.err);   // full stack to console
        }
    }

    // ── Message builders ──────────────────────────────────────────

    private String buildSubject(String status, Long orderId) {
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "Order #" + orderId + " Confirmed | Sri Velva Naturals";
            case "PAID"      -> "Payment Received for Order #" + orderId + " | Sri Velva Naturals";
            case "SHIPPED"   -> "Order #" + orderId + " Shipped | Sri Velva Naturals";
            case "DELIVERED" -> "Order #" + orderId + " Delivered | Sri Velva Naturals";
            case "PENDING"   -> "Order #" + orderId + " Received | Sri Velva Naturals";
            default          -> "Order #" + orderId + " Update | Sri Velva Naturals";
        };
    }

    private String buildHtmlBody(String customerName, Long orderId, String status) {
        String statusLabel = switch (status.toUpperCase()) {
            case "CONFIRMED" -> "&#x2705; Confirmed";
            case "PAID"      -> "&#x1F4B3; Payment Received";
            case "SHIPPED"   -> "&#x1F69A; Shipped";
            case "DELIVERED" -> "&#x1F4E6; Delivered";
            case "PENDING"   -> "&#x23F3; Pending";
            default          -> status;
        };

        String statusDetail = switch (status.toUpperCase()) {
            case "CONFIRMED" -> "We have received your order and are preparing it for dispatch.";
            case "PAID"      -> "Your payment has been confirmed. We will dispatch your order shortly.";
            case "SHIPPED"   -> "Your order is on its way! Please allow 2-5 business days for delivery.";
            case "DELIVERED" -> "Your order has been delivered. We hope you love your Sri Velva Naturals products!";
            case "PENDING"   -> "Your order has been placed and is awaiting confirmation. We will update you soon.";
            default          -> "Your order status has been updated by our team.";
        };

        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#f9f7f3;font-family:Arial,Helvetica,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0"
                     style="background:#f9f7f3;padding:32px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden;
                                box-shadow:0 4px 16px rgba(0,0,0,0.08);max-width:560px;width:100%%;">
                    <tr>
                      <td style="background:#2D5016;padding:28px 32px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;
                                   font-family:Georgia,serif;font-weight:normal;">
                          Sri Velva Naturals
                        </h1>
                        <p style="margin:6px 0 0;color:#c8e6a0;font-size:13px;
                                  letter-spacing:2px;">PURE &middot; NATURAL &middot; COLD PRESSED OILS</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 16px;font-size:16px;color:#333;">
                          Dear <strong>%s</strong>,
                        </p>
                        <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                          Thank you for shopping with Sri Velva Naturals.
                          Here is your latest order update:
                        </p>
                        <table width="100%%" cellpadding="0" cellspacing="0"
                               style="background:#f0f7e8;border-left:4px solid #2D5016;
                                      border-radius:0 8px 8px 0;margin-bottom:24px;">
                          <tr>
                            <td style="padding:20px 24px;">
                              <p style="margin:0 0 4px;font-size:12px;color:#888;
                                        text-transform:uppercase;letter-spacing:1px;">Order ID</p>
                              <p style="margin:0 0 16px;font-size:22px;font-weight:bold;
                                        color:#2D5016;">#%d</p>
                              <p style="margin:0 0 4px;font-size:12px;color:#888;
                                        text-transform:uppercase;letter-spacing:1px;">Status</p>
                              <p style="margin:0;font-size:20px;font-weight:bold;
                                        color:#2D5016;">%s</p>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">%s</p>
                        <p style="margin:0 0 8px;font-size:14px;color:#555;">For questions, contact us:</p>
                        <ul style="margin:0 0 24px;padding-left:20px;color:#555;font-size:14px;line-height:1.8;">
                          <li>Email: <a href="mailto:info@srivelvanaturals.com"
                                        style="color:#2D5016;">info@srivelvanaturals.com</a></li>
                          <li>WhatsApp: +91 9944268288</li>
                        </ul>
                        <p style="margin:0;font-size:15px;color:#333;">
                          Warm regards,<br/><strong>Sri Velva Naturals Team</strong>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f0f7e8;padding:20px 32px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
                          &copy; Sri Velva Naturals &middot; Velur, Tamil Nadu, India
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(esc(customerName), orderId, statusLabel, esc(statusDetail));
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;");
    }
}
