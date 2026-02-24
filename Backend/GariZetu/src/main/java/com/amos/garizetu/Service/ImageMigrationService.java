package com.amos.garizetu.Service;

import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.Repository.CarRepository;
import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageMigrationService {

    private final CarRepository carRepository;
    private final FileStorageService fileStorageService;
    private final Cloudinary cloudinary;

    @Transactional
    public MigrationResult migrateAllCarImagesToCloudinary() {
        log.info("Starting migration of car images to Cloudinary");

        List<Car> allCars = carRepository.findAll();
        int totalCars = allCars.size();
        int migratedCars = 0;
        int failedCars = 0;
        List<String> errors = new ArrayList<>();

        for (Car car : allCars) {
            try {
                boolean carUpdated = false;

                // Migrate main image if it's a local path
                if (car.getMainImageUrl() != null && !car.getMainImageUrl().startsWith("http")) {
                    String newUrl = migrateImage(car.getMainImageUrl(), car.getCarId(), "main");
                    if (newUrl != null) {
                        car.setMainImageUrl(newUrl);
                        carUpdated = true;
                        log.info("Migrated main image for car {}: {}", car.getCarId(), newUrl);
                    }
                }

                // Migrate gallery images if they are local paths
                if (car.getGalleryImageUrls() != null && !car.getGalleryImageUrls().isEmpty()) {
                    List<String> migratedGalleryUrls = new ArrayList<>();
                    boolean galleryChanged = false;

                    for (int i = 0; i < car.getGalleryImageUrls().size(); i++) {
                        String galleryUrl = car.getGalleryImageUrls().get(i);

                        if (!galleryUrl.startsWith("http")) {
                            String newUrl = migrateImage(galleryUrl, car.getCarId(), "gallery-" + i);
                            if (newUrl != null) {
                                migratedGalleryUrls.add(newUrl);
                                galleryChanged = true;
                                log.info("Migrated gallery image {} for car {}: {}", i, car.getCarId(), newUrl);
                            } else {
                                migratedGalleryUrls.add(galleryUrl);
                            }
                        } else {
                            migratedGalleryUrls.add(galleryUrl);
                        }
                    }

                    if (galleryChanged) {
                        car.setGalleryImageUrls(migratedGalleryUrls);
                        carUpdated = true;
                    }
                }

                if (carUpdated) {
                    carRepository.save(car);
                    migratedCars++;
                    log.info("Successfully migrated images for car {}", car.getCarId());
                }

            } catch (Exception e) {
                failedCars++;
                String errorMsg = "Failed to migrate images for car " + car.getCarId() + ": " + e.getMessage();
                log.error(errorMsg, e);
                errors.add(errorMsg);
            }
        }

        String summary = String.format("Migration completed: %d total cars, %d migrated, %d failed",
                                       totalCars, migratedCars, failedCars);
        log.info(summary);

        return new MigrationResult(totalCars, migratedCars, failedCars, errors, summary);
    }

    private String migrateImage(String localImageUrl, Long carId, String imageType) {
        try {
            // Extract filename from local URL pattern: /api/v1/cars/images/filename.jpg
            String fileName = localImageUrl.replace("/api/v1/cars/images/", "");

            log.info("Attempting to migrate {} for car {}: {}", imageType, carId, fileName);

            // Try to load the file from local storage
            Resource resource = fileStorageService.loadFileAsResource(fileName);

            if (resource == null || !resource.exists()) {
                log.warn("Local file not found for migration: {}", fileName);
                return null;
            }

            // Upload directly to Cloudinary using InputStream
            try (InputStream inputStream = resource.getInputStream()) {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    inputStream.readAllBytes(),
                    Map.of(
                        "folder", "garizetu/cars",
                        "resource_type", "image",
                        "public_id", "migrated-" + System.currentTimeMillis() + "-" + fileName.substring(0, fileName.lastIndexOf('.'))
                    )
                );

                String cloudinaryUrl = uploadResult.get("secure_url").toString();
                log.info("Successfully uploaded to Cloudinary: {}", cloudinaryUrl);

                return cloudinaryUrl;
            }

        } catch (IOException e) {
            log.error("Failed to migrate image {} for car {}: {}", imageType, carId, e.getMessage());
            return null;
        } catch (RuntimeException e) {
            // File not found in local storage - this is expected for old deployments
            log.warn("Could not find local file for migration ({}): {}", imageType, e.getMessage());
            return null;
        }
    }


    public static class MigrationResult {
        public final int totalCars;
        public final int migratedCars;
        public final int failedCars;
        public final List<String> errors;
        public final String summary;

        public MigrationResult(int totalCars, int migratedCars, int failedCars, List<String> errors, String summary) {
            this.totalCars = totalCars;
            this.migratedCars = migratedCars;
            this.failedCars = failedCars;
            this.errors = errors;
            this.summary = summary;
        }
    }
}
