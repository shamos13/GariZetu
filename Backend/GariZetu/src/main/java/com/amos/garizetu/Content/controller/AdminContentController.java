package com.amos.garizetu.Content.controller;

import com.amos.garizetu.Content.DTO.BrandLogoResponse;
import com.amos.garizetu.Content.DTO.BrandLogoUploadResponse;
import com.amos.garizetu.Content.DTO.BrandLogoUpsertRequest;
import com.amos.garizetu.Content.DTO.ContactSectionSettingsResponse;
import com.amos.garizetu.Content.DTO.ContactSectionSettingsUpdateRequest;
import com.amos.garizetu.Content.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/content")
@RequiredArgsConstructor
@Slf4j
public class AdminContentController {

    private final ContentService contentService;

    @GetMapping("/brand-logos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BrandLogoResponse>> getBrandLogos() {
        return ResponseEntity.ok(contentService.getBrandLogoOverrides());
    }

    @PutMapping("/brand-logos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandLogoResponse> upsertBrandLogo(@Valid @RequestBody BrandLogoUpsertRequest request) {
        log.info("Admin upserting brand logo override for {}", request.getBrandName());
        return ResponseEntity.ok(contentService.upsertBrandLogo(request));
    }

    @PostMapping(value = "/brand-logos/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BrandLogoUploadResponse> uploadBrandLogo(@RequestParam("image") MultipartFile image) {
        String logoUrl = contentService.uploadBrandLogoImage(image);
        String fileName = logoUrl.substring(logoUrl.lastIndexOf('/') + 1);
        return ResponseEntity.ok(new BrandLogoUploadResponse(fileName, logoUrl));
    }

    @DeleteMapping("/brand-logos/{brandKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBrandLogo(@PathVariable String brandKey) {
        log.info("Admin deleting brand logo override for key {}", brandKey);
        contentService.deleteBrandLogo(brandKey);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contact")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactSectionSettingsResponse> getContactSettings() {
        return ResponseEntity.ok(contentService.getContactSettings());
    }

    @PatchMapping("/contact")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactSectionSettingsResponse> updateContactSettings(
            @Valid @RequestBody ContactSectionSettingsUpdateRequest request
    ) {
        log.info("Admin updating contact section settings");
        return ResponseEntity.ok(contentService.updateContactSettings(request));
    }
}
