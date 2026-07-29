package com.srivelva.repository;

import com.srivelva.model.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {
    // No extra methods needed — always use findAll().getFirst() since there is exactly one row.
}
