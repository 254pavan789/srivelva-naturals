package com.srivelva.controller;

import com.srivelva.dto.ApiResponse;
import com.srivelva.model.Settings;
import com.srivelva.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    /**
     * GET /api/settings
     * Returns the current business configuration (WhatsApp number, email, etc.).
     * Used by both the frontend (to fetch the live WhatsApp number) and the
     * admin panel (to pre-fill the settings form).
     *
     * Response shape:
     * {
     *   "success": true,
     *   "data": {
     *     "id":              1,
     *     "whatsappNumber":  "9944268288",
     *     "email":           "info@srivelvanaturals.com",
     *     "updatedAt":       "2024-12-01T10:00:00"
     *   }
     * }
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Settings>> getSettings() {
        Settings settings = settingsService.getSettings();
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    /**
     * PUT /api/settings
     * Updates the business configuration.
     * Only the fields provided in the request body are changed; omitted
     * fields retain their existing values (handled in the service layer).
     *
     * Request body example:
     * {
     *   "whatsappNumber": "9876543210",
     *   "email":          "contact@srivelvanaturals.com"
     * }
     */
    @PutMapping
    public ResponseEntity<ApiResponse<Settings>> updateSettings(
            @RequestBody Settings incoming) {

        Settings updated = settingsService.updateSettings(incoming);
        return ResponseEntity.ok(ApiResponse.ok("Settings updated successfully", updated));
    }
}
