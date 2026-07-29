package com.srivelva.service;

import com.srivelva.model.Settings;
import com.srivelva.repository.SettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    /**
     * There is always exactly one settings row (seeded by DataInitializer).
     * Returns it, or a blank Settings object if somehow missing.
     */
    @Transactional(readOnly = true)
    public Settings getSettings() {
        return settingsRepository.findAll()
                                 .stream()
                                 .findFirst()
                                 .orElseGet(Settings::new);
    }

    /**
     * Upsert: update the existing row, or create one if it doesn't exist yet.
     */
    public Settings updateSettings(Settings incoming) {
        Settings existing = settingsRepository.findAll()
                                              .stream()
                                              .findFirst()
                                              .orElseGet(Settings::new);

        if (incoming.getWhatsappNumber() != null) {
            existing.setWhatsappNumber(incoming.getWhatsappNumber());
        }
        if (incoming.getEmail() != null) {
            existing.setEmail(incoming.getEmail());
        }

        return settingsRepository.save(existing);
    }
}
