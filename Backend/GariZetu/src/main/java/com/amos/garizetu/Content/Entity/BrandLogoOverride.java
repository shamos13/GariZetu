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
@Table(name = "brand_logo_overrides")
public class BrandLogoOverride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_logo_id")
    private Long brandLogoId;

    @Column(name = "brand_name", nullable = false, length = 80)
    private String brandName;

    @Column(name = "brand_key", nullable = false, unique = true, length = 100)
    private String brandKey;

    @Column(name = "logo_url", nullable = false, length = 500)
    private String logoUrl;

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
