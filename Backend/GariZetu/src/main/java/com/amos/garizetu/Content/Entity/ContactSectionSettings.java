package com.amos.garizetu.Content.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "contact_section_settings")
public class ContactSectionSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "settings_id")
    private Long settingsId;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(length = 40)
    private String altPhone;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 120)
    private String supportEmail;

    @Column(nullable = false, length = 40)
    private String whatsapp;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 80)
    private String hours;

    @Column(nullable = false, length = 80)
    private String sundayHours;

    @Column(length = 80)
    private String jkiaDeskHours;

    @Column(nullable = false, length = 80)
    private String heroTitle;

    @Column(nullable = false, length = 300)
    private String heroDescription;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
