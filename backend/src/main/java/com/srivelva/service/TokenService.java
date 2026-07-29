package com.srivelva.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;

/**
 * TokenService — stateless signed token for admin authentication.
 *
 * Uses HMAC-SHA256 from the Java standard library.
 * No Spring Security, no new Maven dependencies required.
 *
 * Token format:  base64(payload) + "." + hex(HMAC-SHA256(base64(payload), secret))
 * Payload:       "admin:{issuedAtMillis}:{expiryMillis}"
 *
 * Tokens expire after ADMIN_TOKEN_EXPIRY_HOURS (default 8h).
 * The secret is read from ADMIN_JWT_SECRET env var (falls back to a dev default —
 * always set this in production).
 */
@Service
public class TokenService {

    private static final Logger log        = LoggerFactory.getLogger(TokenService.class);
    private static final String ALGORITHM  = "HmacSHA256";
    private static final String SUBJECT    = "admin";
    private static final long   TTL_MS     = 8L * 60 * 60 * 1000; // 8 hours

    @Value("${admin.jwt-secret:srivelva-dev-secret-change-in-production-2024}")
    private String secret;

    // ── Public API ───────────────────────────────────────────────

    /** Generates a signed token valid for 8 hours. */
    public String generate() {
        long now    = System.currentTimeMillis();
        long expiry = now + TTL_MS;
        String payload = SUBJECT + ":" + now + ":" + expiry;
        String encoded = Base64.getEncoder().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String sig     = hmac(encoded);
        return encoded + "." + sig;
    }

    /**
     * Validates a token.
     * @return true if the token is structurally valid, signed correctly, and not expired
     */
    public boolean validate(String token) {
        if (token == null || token.isBlank()) return false;
        try {
            String[] parts = token.split("\\.", 2);
            if (parts.length != 2) return false;

            String encoded = parts[0];
            String sig     = parts[1];

            // 1. Verify signature
            if (!sig.equals(hmac(encoded))) {
                log.warn("[Auth] Invalid token signature");
                return false;
            }

            // 2. Verify expiry
            String payload = new String(Base64.getDecoder().decode(encoded), StandardCharsets.UTF_8);
            String[] fields = payload.split(":");
            if (fields.length != 3 || !SUBJECT.equals(fields[0])) return false;

            long expiry = Long.parseLong(fields[2]);
            if (System.currentTimeMillis() > expiry) {
                log.warn("[Auth] Token expired");
                return false;
            }

            return true;
        } catch (Exception e) {
            log.warn("[Auth] Token parse error: {}", e.getMessage());
            return false;
        }
    }

    // ── Internal ─────────────────────────────────────────────────

    private String hmac(String data) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALGORITHM));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }
}
