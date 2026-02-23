package com.amos.garizetu.config;
import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Repository.FeatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
@Slf4j
public class FeatureSeeder implements CommandLineRunner {

    private final FeatureRepository featureRepository;

    @Override
    public void run(String... args) {
        if (featureRepository.count() == 0) {
            log.info("🌱 Seeding initial features...");

            // Technology
            createFeature("GPS Navigation", "Built-in GPS navigation system", "TECHNOLOGY");
            createFeature("Bluetooth", "Hands-free calling and audio", "TECHNOLOGY");
            createFeature("Apple CarPlay", "Apple CarPlay integration", "TECHNOLOGY");
            createFeature("USB Charging", "Multiple USB charging ports", "TECHNOLOGY");

            // Comfort
            createFeature("Leather Seats", "Premium leather upholstery", "COMFORT");
            createFeature("Heated Seats", "Front heated seats", "COMFORT");
            createFeature("Climate Control", "Automatic climate control", "COMFORT");
            createFeature("Sunroof", "Panoramic sunroof", "COMFORT");

            // Safety
            createFeature("Backup Camera", "Rear-view camera for parking", "SAFETY");
            createFeature("ABS Brakes", "Anti-lock braking system", "SAFETY");
            createFeature("Parking Sensors", "Front and rear parking sensors", "SAFETY");
            createFeature("Airbags", "Driver and passenger airbags", "SAFETY");

            log.info("✅ Features seeded successfully - {} features created", featureRepository.count());
        } else {
            log.info("ℹ️  Features already exist - skipping seed");
        }
    }

    private void createFeature(String name, String description, String category) {
        Feature feature = new Feature();
        feature.setFeatureName(name);
        feature.setFeatureDescription(description);
        feature.setFeatureCategory(category);
        featureRepository.save(feature);
    }
}
