package com.amos.garizetu.config;

import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.Car.Enums.BodyType;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FeaturedCategory;
import com.amos.garizetu.Car.Enums.FuelType;
import com.amos.garizetu.Car.Enums.TransmissionType;
import com.amos.garizetu.Repository.CarRepository;
import com.amos.garizetu.Service.FeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Order(2)
@Slf4j
public class CarSeeder implements CommandLineRunner {

    private final CarRepository carRepository;
    private final FeatureService featureService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("🌱 Ensuring initial fleet cars exist...");

        int inserted = 0;
        int skipped = 0;

        if (seedIfMissing(
                "Toyota",
                "KDG101A",
                "Camry",
                2023,
                2500,
                "White",
                15000,
                3500.0,
                5,
                "/nissan-maxima-white.jpg",
                "/audi-a8-gray.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.PETROL,
                BodyType.SEDAN,
                FeaturedCategory.POPULAR_CAR,
                "Reliable and refined sedan with excellent comfort for business and city travel.",
                List.of("Apple CarPlay", "Backup Camera", "Climate Control", "ABS Brakes")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Nissan",
                "KDG102B",
                "X-Trail",
                2023,
                2000,
                "Black",
                12000,
                4200.0,
                7,
                "/porsche-cayenne-black.jpg",
                "/nissan-maxima-white.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.PETROL,
                BodyType.SUV,
                FeaturedCategory.FAMILY_CAR,
                "Spacious SUV with practical seating and modern convenience features for long trips.",
                List.of("GPS Navigation", "Bluetooth", "Parking Sensors", "Airbags")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Mercedes-Benz",
                "KDG103C",
                "E-Class",
                2022,
                2000,
                "Silver",
                18000,
                6200.0,
                5,
                "/audi-a8-gray.jpg",
                "/porsche-cayenne-black.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.HYBRID,
                BodyType.SEDAN,
                FeaturedCategory.LUXURY_CAR,
                "Executive luxury sedan delivering premium comfort, smooth handling, and advanced safety.",
                List.of("Leather Seats", "Sunroof", "Climate Control", "Parking Sensors")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "BMW",
                "KDG104D",
                "X5",
                2021,
                3000,
                "Gray",
                22000,
                7800.0,
                5,
                "/porsche-cayenne-black.jpg",
                "/audi-a8-gray.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.DIESEL,
                BodyType.SUV,
                FeaturedCategory.LUXURY_CAR,
                "Performance-focused premium SUV with powerful acceleration and refined interior quality.",
                List.of("GPS Navigation", "Heated Seats", "Airbags", "Backup Camera")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Volkswagen",
                "KDG105E",
                "Golf",
                2019,
                1800,
                "Blue",
                30000,
                3000.0,
                5,
                "/nissan-maxima-white.jpg",
                "/audi-a8-gray.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.MANUAL,
                FuelType.PETROL,
                BodyType.HATCHBACK,
                FeaturedCategory.VINTAGE_CAR,
                "Classic hatchback feel with efficient performance and practical daily usability.",
                List.of("Bluetooth", "USB Charging", "ABS Brakes", "Airbags")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Land Rover",
                "KDG106F",
                "Defender",
                2020,
                3000,
                "Green",
                26000,
                8600.0,
                5,
                "/porsche-cayenne-black.jpg",
                "/nissan-maxima-white.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.DIESEL,
                BodyType.SUV,
                FeaturedCategory.OFF_ROAD_CAR,
                "Purpose-built off-road SUV engineered for rugged terrain and long-range adventure.",
                List.of("GPS Navigation", "Parking Sensors", "Backup Camera", "Airbags")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Toyota",
                "KDG107G",
                "Hiace",
                2021,
                2800,
                "White",
                24000,
                5000.0,
                10,
                "/nissan-maxima-white.jpg",
                "/porsche-cayenne-black.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.MANUAL,
                FuelType.DIESEL,
                BodyType.MINIVAN,
                FeaturedCategory.FAMILY_CAR,
                "Large people mover ideal for family groups, events, and shuttle use.",
                List.of("USB Charging", "Airbags", "Climate Control", "Parking Sensors")
        )) inserted++; else skipped++;

        if (seedIfMissing(
                "Audi",
                "KDG108H",
                "A8",
                2022,
                3000,
                "Gray",
                14000,
                7000.0,
                5,
                "/audi-a8-gray.jpg",
                "/nissan-maxima-white.jpg",
                CarStatus.AVAILABLE,
                TransmissionType.AUTOMATIC,
                FuelType.PLUG_IN_HYBRID,
                BodyType.SEDAN,
                FeaturedCategory.POPULAR_CAR,
                "Flagship luxury sedan with premium cabin materials and advanced driving assistance.",
                List.of("Leather Seats", "Sunroof", "Apple CarPlay", "Backup Camera")
        )) inserted++; else skipped++;

        log.info(
                "✅ Fleet seed check complete - inserted: {}, already present: {}, total cars: {}",
                inserted,
                skipped,
                carRepository.count()
        );
    }

    private boolean seedIfMissing(
            String make,
            String registrationNumber,
            String model,
            int year,
            int engineCapacity,
            String colour,
            int mileage,
            double dailyPrice,
            int seatingCapacity,
            String mainImageUrl,
            String galleryImageUrl,
            CarStatus carStatus,
            TransmissionType transmissionType,
            FuelType fuelType,
            BodyType bodyType,
            FeaturedCategory featuredCategory,
            String description,
            List<String> featureNames
    ) {
        if (carRepository.existsByRegistrationNumber(registrationNumber)) {
            return false;
        }

        carRepository.save(createCar(
                make,
                registrationNumber,
                model,
                year,
                engineCapacity,
                colour,
                mileage,
                dailyPrice,
                seatingCapacity,
                mainImageUrl,
                galleryImageUrl,
                carStatus,
                transmissionType,
                fuelType,
                bodyType,
                featuredCategory,
                description,
                featureNames
        ));
        return true;
    }

    private Car createCar(
            String make,
            String registrationNumber,
            String model,
            int year,
            int engineCapacity,
            String colour,
            int mileage,
            double dailyPrice,
            int seatingCapacity,
            String mainImageUrl,
            String galleryImageUrl,
            CarStatus carStatus,
            TransmissionType transmissionType,
            FuelType fuelType,
            BodyType bodyType,
            FeaturedCategory featuredCategory,
            String description,
            List<String> featureNames
    ) {
        Car car = new Car();
        car.setMake(make);
        car.setRegistrationNumber(registrationNumber);
        car.setVehicleModel(model);
        car.setYear(year);
        car.setEngineCapacity(engineCapacity);
        car.setColour(colour);
        car.setMileage(mileage);
        car.setDailyPrice(dailyPrice);
        car.setSeatingCapacity(seatingCapacity);
        car.setMainImageUrl(mainImageUrl);
        car.setGalleryImageUrls(List.of(mainImageUrl, galleryImageUrl));
        car.setDescription(description);
        car.setCarStatus(carStatus);
        car.setTransmissionType(transmissionType);
        car.setFuelType(fuelType);
        car.setBodyType(bodyType);
        car.setFeaturedCategory(featuredCategory);
        car.setFeatures(featureService.processFeatureNames(featureNames));
        return car;
    }
}
