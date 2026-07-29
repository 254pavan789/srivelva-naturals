package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.service.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController — admin login / logout / token verification.
 *
 *   POST /api/auth/login   { username, password } → { token }
 *   POST /api/auth/logout  → 200
 *   POST /api/auth/verify  → 200 or 401   (used internally)
 *   GET  /api/auth/me      → { username } (called by frontend on page load)
 *
 * CREDENTIALS:
 *   Read from application.properties (single admin.username / admin.password block).
 *   Default: admin / admin123
 *   Override with: export ADMIN_USERNAME=x && export ADMIN_PASSWORD=y
 *
 * DEBUG:
 *   Set logging.level.com.srivelva=DEBUG in application.properties to see
 *   the actual injected username/password values printed at startup and login.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // Reads from admin.username — default "admin"
    @Value("${admin.username:admin}")
    private String adminUsername;

    // Reads from admin.password — default "admin123"
    @Value("${admin.password:admin123}")
    private String adminPassword;

    private final TokenService tokenService;

    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    /**
     * Prints the actual injected credentials to the log at INFO level.
     * This fires once after all @Value fields are injected.
     * Remove in production after verifying credentials are correct.
     */
    @jakarta.annotation.PostConstruct
    public void debugCredentials() {
        log.info("[Auth] Loaded admin.username = '{}'", adminUsername);
        // Log only the length — never log the actual password
        log.info("[Auth] Loaded admin.password length = {}", adminPassword.length());
    }

    // ── Endpoints ─────────────────────────────────────────────────

    /**
     * POST /api/auth/login
     * Body: { "username": "admin", "password": "admin123" }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(
            @RequestBody Map<String, String> body) {

        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "").trim();

        log.debug("[Auth] Login attempt — submitted username='{}'", username);

        boolean usernameMatch = adminUsername.equals(username);
        boolean passwordMatch = adminPassword.equals(password);

        log.debug("[Auth] Username match={} | Password match={}", usernameMatch, passwordMatch);

        if (usernameMatch && passwordMatch) {
            String token = tokenService.generate();
            log.info("[Auth] Login successful for username='{}'", username);
            return ResponseEntity.ok(
                ApiResponse.ok("Login successful",
                    Map.of("token", token, "username", username)));
        }

        log.warn("[Auth] Login FAILED — username='{}' (usernameMatch={}, passwordMatch={})",
                 username, usernameMatch, passwordMatch);

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    /**
     * POST /api/auth/logout
     * Stateless — client drops the token. Nothing to invalidate server-side.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    /**
     * POST /api/auth/verify
     * Validates the Bearer token in Authorization header.
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractBearer(authHeader);
        if (tokenService.validate(token)) {
            return ResponseEntity.ok(ApiResponse.success("Token is valid"));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(ApiResponse.error("Token is invalid or expired"));
    }

    /**
     * GET /api/auth/me
     * Returns the username encoded in the token.
     * Called by the frontend Admin component on mount to verify the stored token.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, String>>> me(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractBearer(authHeader);
        if (tokenService.validate(token)) {
            return ResponseEntity.ok(
                ApiResponse.ok(Map.of("username", adminUsername)));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body(ApiResponse.error("Unauthorized — please log in"));
    }

    // ── Helpers ───────────────────────────────────────────────────

    private String extractBearer(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }
}
