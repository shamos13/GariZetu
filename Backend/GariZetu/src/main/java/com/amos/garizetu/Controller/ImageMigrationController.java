package com.amos.garizetu.Controller;

import com.amos.garizetu.Service.ImageMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/admin/migration")
public class ImageMigrationController {

    private final ImageMigrationService migrationService;

    /**
     * Endpoint to migrate all car images from local storage to Cloudinary.
     * This should be called once after Cloudinary is configured.
     *
     * Only accessible by ADMIN users.
     *
     * Example: POST /api/v1/admin/migration/images-to-cloudinary
     */
    @PostMapping("/images-to-cloudinary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> migrateImagesToCloudinary() {
        log.info("Admin initiated image migration to Cloudinary");

        try {
            ImageMigrationService.MigrationResult result = migrationService.migrateAllCarImagesToCloudinary();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalCars", result.totalCars);
            response.put("migratedCars", result.migratedCars);
            response.put("failedCars", result.failedCars);
            response.put("summary", result.summary);
            response.put("errors", result.errors);

            log.info("Migration completed: {}", result.summary);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Migration failed with exception", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Migration failed: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
