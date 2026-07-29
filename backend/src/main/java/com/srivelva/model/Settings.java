package com.srivelva.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * WhatsApp number WITHOUT country code prefix.
     * The frontend prepends +91 or the appropriate code.
     */
    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(length = 200)
    private String email;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── Constructors ──
    public Settings() {}

    public Settings(String whatsappNumber, String email) {
        this.whatsappNumber = whatsappNumber;
        this.email          = email;
    }

    // ── Getters & Setters ──
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }

    public String getWhatsappNumber()                { return whatsappNumber; }
    public void setWhatsappNumber(String number)     { this.whatsappNumber = number; }

    public String getEmail()                         { return email; }
    public void setEmail(String email)               { this.email = email; }

    public LocalDateTime getUpdatedAt()              { return updatedAt; }
}
