package com.amos.garizetu.Content.service;

import com.amos.garizetu.Content.DTO.BrandLogoResponse;
import com.amos.garizetu.Content.DTO.BrandLogoUpsertRequest;
import com.amos.garizetu.Content.DTO.ContactSectionSettingsResponse;
import com.amos.garizetu.Content.DTO.ContactSectionSettingsUpdateRequest;
import com.amos.garizetu.Content.Entity.BrandLogoOverride;
import com.amos.garizetu.Content.Entity.ContactSectionSettings;
import com.amos.garizetu.Content.Repository.BrandLogoOverrideRepository;
import com.amos.garizetu.Content.Repository.ContactSectionSettingsRepository;
import com.amos.garizetu.Service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.function.Consumer;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContentService {

    private static final Pattern LOGO_SUFFIX_PATTERN = Pattern.compile(
            "(?i).+\\.(svg|png|jpg|jpeg|webp)(?:\\?.*)?$"
    );
    private static final String LOGO_IMAGE_PUBLIC_PREFIX = "/api/v1/cars/images/";

    private final BrandLogoOverrideRepository brandLogoOverrideRepository;
    private final ContactSectionSettingsRepository contactSectionSettingsRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<BrandLogoResponse> getBrandLogoOverrides() {
        return brandLogoOverrideRepository.findAllByOrderByBrandNameAsc().stream()
                .map(this::toBrandLogoResponse)
                .toList();
    }

    public BrandLogoResponse upsertBrandLogo(BrandLogoUpsertRequest request) {
        String brandName = normalizeRequired(request.getBrandName(), "Brand name");
        String brandKey = normalizeBrandKey(brandName);
        String logoUrl = normalizeAndValidateLogoUrl(request.getLogoUrl());

        BrandLogoOverride logoOverride = brandLogoOverrideRepository.findByBrandKey(brandKey)
                .orElseGet(BrandLogoOverride::new);

        logoOverride.setBrandName(brandName);
        logoOverride.setBrandKey(brandKey);
        logoOverride.setLogoUrl(logoUrl);

        BrandLogoOverride saved = brandLogoOverrideRepository.save(logoOverride);
        log.info("Brand logo override saved for {}", brandKey);
        return toBrandLogoResponse(saved);
    }

    public String uploadBrandLogoImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Logo image file is required");
        }

        String storedFileName = fileStorageService.storeFile(image);
        log.info("Brand logo image uploaded as {}", storedFileName);

        return LOGO_IMAGE_PUBLIC_PREFIX + storedFileName;
    }

    public void deleteBrandLogo(String brandKey) {
        String normalizedKey = normalizeBrandKey(brandKey);
        BrandLogoOverride logoOverride = brandLogoOverrideRepository.findByBrandKey(normalizedKey)
                .orElseThrow(() -> new RuntimeException("No logo override found for brand key " + normalizedKey));

        brandLogoOverrideRepository.delete(logoOverride);
        log.info("Brand logo override deleted for {}", normalizedKey);
    }

    public ContactSectionSettingsResponse getContactSettings() {
        return toContactSettingsResponse(getOrCreateContactSettings());
    }

    public ContactSectionSettingsResponse updateContactSettings(ContactSectionSettingsUpdateRequest request) {
        ContactSectionSettings settings = getOrCreateContactSettings();

        if (request.getPhone() != null) {
            applyRequired(settings::setPhone, request.getPhone(), "Phone");
        }
        if (request.getAltPhone() != null) {
            applyOptional(settings::setAltPhone, request.getAltPhone());
        }
        if (request.getEmail() != null) {
            applyRequired(settings::setEmail, request.getEmail(), "Email");
        }
        if (request.getSupportEmail() != null) {
            applyOptional(settings::setSupportEmail, request.getSupportEmail());
        }
        if (request.getWhatsapp() != null) {
            applyRequired(settings::setWhatsapp, request.getWhatsapp(), "WhatsApp");
        }
        if (request.getAddress() != null) {
            applyRequired(settings::setAddress, request.getAddress(), "Address");
        }
        if (request.getCity() != null) {
            applyRequired(settings::setCity, request.getCity(), "City");
        }
        if (request.getHours() != null) {
            applyRequired(settings::setHours, request.getHours(), "Business hours");
        }
        if (request.getSundayHours() != null) {
            applyRequired(settings::setSundayHours, request.getSundayHours(), "Sunday hours");
        }
        if (request.getJkiaDeskHours() != null) {
            applyOptional(settings::setJkiaDeskHours, request.getJkiaDeskHours());
        }
        if (request.getHeroTitle() != null) {
            applyRequired(settings::setHeroTitle, request.getHeroTitle(), "Hero title");
        }
        if (request.getHeroDescription() != null) {
            applyRequired(settings::setHeroDescription, request.getHeroDescription(), "Hero description");
        }

        ContactSectionSettings saved = contactSectionSettingsRepository.save(settings);
        log.info("Contact section settings updated");

        return toContactSettingsResponse(saved);
    }

    private ContactSectionSettings getOrCreateContactSettings() {
        return contactSectionSettingsRepository.findTopByOrderBySettingsIdAsc()
                .orElseGet(() -> contactSectionSettingsRepository.save(buildDefaultContactSettings()));
    }

    private ContactSectionSettings buildDefaultContactSettings() {
        ContactSectionSettings settings = new ContactSectionSettings();
        settings.setPhone("+254 712 345 678");
        settings.setAltPhone("+254 720 987 654");
        settings.setEmail("info@garizetu.co.ke");
        settings.setSupportEmail("support@garizetu.co.ke");
        settings.setWhatsapp("+254712345678");
        settings.setAddress("Westlands Business Park, 3rd Floor");
        settings.setCity("Nairobi, Kenya");
        settings.setHours("Mon - Sat: 8:00 AM - 6:00 PM");
        settings.setSundayHours("Sunday: 9:00 AM - 4:00 PM");
        settings.setJkiaDeskHours("6:00 AM - 11:00 PM");
        settings.setHeroTitle("Get in Touch");
        settings.setHeroDescription(
                "Have questions? We're here to help. Reach out to our team through any of the channels below."
        );
        return settings;
    }

    private BrandLogoResponse toBrandLogoResponse(BrandLogoOverride logoOverride) {
        return new BrandLogoResponse(
                logoOverride.getBrandName(),
                logoOverride.getBrandKey(),
                logoOverride.getLogoUrl(),
                logoOverride.getUpdatedAt()
        );
    }

    private ContactSectionSettingsResponse toContactSettingsResponse(ContactSectionSettings settings) {
        return new ContactSectionSettingsResponse(
                settings.getPhone(),
                settings.getAltPhone(),
                settings.getEmail(),
                settings.getSupportEmail(),
                settings.getWhatsapp(),
                settings.getAddress(),
                settings.getCity(),
                settings.getHours(),
                settings.getSundayHours(),
                settings.getJkiaDeskHours(),
                settings.getHeroTitle(),
                settings.getHeroDescription()
        );
    }

    private String normalizeRequired(String rawValue, String fieldLabel) {
        if (!StringUtils.hasText(rawValue)) {
            throw new RuntimeException(fieldLabel + " is required");
        }
        return rawValue.trim();
    }

    private void applyRequired(Consumer<String> setter, String rawValue, String fieldLabel) {
        setter.accept(normalizeRequired(rawValue, fieldLabel));
    }

    private void applyOptional(Consumer<String> setter, String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            setter.accept(null);
            return;
        }
        setter.accept(rawValue.trim());
    }

    private String normalizeBrandKey(String brandName) {
        String normalized = brandName == null
                ? ""
                : brandName.trim().toLowerCase(Locale.ROOT)
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");

        if (!StringUtils.hasText(normalized)) {
            throw new RuntimeException("Brand name must include letters or numbers");
        }

        return normalized;
    }

    private String normalizeAndValidateLogoUrl(String rawLogoUrl) {
        String normalized = normalizeRequired(rawLogoUrl, "Logo URL");

        boolean isRelativeUrl = normalized.startsWith("/");
        boolean isAbsoluteUrl = normalized.startsWith("http://") || normalized.startsWith("https://");

        if (!isRelativeUrl && !isAbsoluteUrl) {
            throw new RuntimeException("Logo URL must start with /, http://, or https://");
        }

        if (!LOGO_SUFFIX_PATTERN.matcher(normalized).matches()) {
            throw new RuntimeException("Logo URL must point to an image format (svg, png, jpg, jpeg, webp)");
        }

        return normalized;
    }
}
