package com.amos.garizetu.Service;

import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Booking.Enums.BookingStatus;
import com.amos.garizetu.Booking.Enums.PaymentStatus;
import com.amos.garizetu.Booking.repository.BookingRepository;
import com.amos.garizetu.Car.DTO.Request.CarCreateRequest;
import com.amos.garizetu.Car.DTO.Request.CarUpdateDTO;
import com.amos.garizetu.Car.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Car.Enums.CarAvailabilityStatus;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FeaturedCategory;
import com.amos.garizetu.Repository.CarRepository;
import com.amos.garizetu.Car.mapper.CarMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CarService {
    private static final String LOCAL_IMAGE_PREFIX = "/api/v1/cars/images/";
    private static final Set<BookingStatus> SOFT_LOCK_STATUSES = Set.of(
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.PENDING
    );
    private static final Set<BookingStatus> BOOKED_STATUSES = Set.of(
            BookingStatus.CONFIRMED,
            BookingStatus.ADMIN_NOTIFIED,
            BookingStatus.ACTIVE
    );
    private static final Set<PaymentStatus> SOFT_LOCK_PAYMENT_STATUSES = Set.of(
            PaymentStatus.UNPAID,
            PaymentStatus.FAILED
    );

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final FileStorageService fileStorageService;
    private final FeatureService featureService;
    private final BookingRepository bookingRepository;


    //Create a new car with image upload
    public CarResponseDTO createCar(CarCreateRequest carCreateRequest) {
        log.info("Create a new car with registration: {}", carCreateRequest.getRegistrationNumber());

        //Business rule 1: Check Duplicate registration
        if (carRepository.existsByRegistrationNumber(carCreateRequest.getRegistrationNumber())){
            throw  new RuntimeException("Car with registration number " + carCreateRequest.getRegistrationNumber() + " already exists");
        }

        if (carCreateRequest.getImage() == null || carCreateRequest.getImage().isEmpty()) {
            throw new RuntimeException("Main image is required");
        }

        //Store the image first and get the file name or URL
        String storedFileNameOrUrl = fileStorageService.storeFile(carCreateRequest.getImage());
        log.info("Storing image: {}", storedFileNameOrUrl);

        //Build image Url that will be stored in the db
        // If it's already a full URL (Cloudinary), use it as-is, otherwise build local path
        String imageUrl = storedFileNameOrUrl.startsWith("http")
                ? storedFileNameOrUrl
                : "/api/v1/cars/images/" + storedFileNameOrUrl;

        Car car = carMapper.toEntity(carCreateRequest);
        car.setMainImageUrl(imageUrl);

        // Store gallery images if provided
        if (carCreateRequest.getGalleryImages() != null && !carCreateRequest.getGalleryImages().isEmpty()) {
            List<String> galleryUrls = carCreateRequest.getGalleryImages().stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(fileStorageService::storeFile)
                    .map(fileNameOrUrl -> fileNameOrUrl.startsWith("http")
                            ? fileNameOrUrl
                            : "/api/v1/cars/images/" + fileNameOrUrl)
                    .collect(Collectors.toList());
            car.setGalleryImageUrls(galleryUrls);
        }

        //Business rule 2: Validate car year
        validateCarYear(carCreateRequest.getYear());


        //Business rule 3: New cars should default to available if not Specified
        if (car.getCarStatus()==null){
            car.setCarStatus(CarStatus.AVAILABLE);
        }

        // Business rule 4: Featured category defaults to Popular Car.
        if (car.getFeaturedCategory() == null) {
            car.setFeaturedCategory(FeaturedCategory.POPULAR_CAR);
        }

        //Processing Features
        if (carCreateRequest.getFeatureName() != null && !carCreateRequest.getFeatureName().isEmpty()) {
            log.info("Processing {} features", carCreateRequest.getFeatureName().size());
            Set<Feature> features = featureService.processFeatureNames(
                    carCreateRequest.getFeatureName());
            car.setFeatures(features);
            log.info("Features assigned: {}", features.size());
        }

        //Save to database
        Car savedCar = carRepository.save(car);
        log.info("Car created successfully with ID: {}",savedCar.getCarId());

        return toResponseWithAvailability(savedCar, LocalDateTime.now());


    }

    /*
    *
    *
    * This is the Response section
    *
    *
    * */
    // Reading the Response

    //Reading a single response
    @Transactional(readOnly = true)
    public CarResponseDTO getCarById(Long id) {
        log.debug("Fetching car with ID: {}", id);
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));
        log.debug("Car {} has {} features", id, car.getFeatures() != null ? car.getFeatures().size() : 0);
        return toResponseWithAvailability(car, LocalDateTime.now());
    }

    //Fetch all Cars
    @Transactional(readOnly = true)
    public List<CarResponseDTO> getAllCars(){
        log.debug("Fetching all cars");
        List<Car> cars = carRepository.findAllWithFeatures();
        LocalDateTime now = LocalDateTime.now();
        Map<Long, List<Booking>> bookingsByCarId = loadBlockingBookingsByCar(cars, now);
        log.debug("Fetched {} cars", cars.size());
        return cars.stream()
                .map(car -> toResponseWithAvailability(
                        car,
                        now,
                        bookingsByCarId.getOrDefault(car.getCarId(), List.of())
                ))
                .collect(Collectors.toList());

    }

    @Transactional(readOnly = true)
    public Page<CarResponseDTO> getAllCarsPage(Pageable pageable) {
        Page<Car> carsPage = carRepository.findAllWithFeatures(pageable);
        LocalDateTime now = LocalDateTime.now();
        List<Car> cars = carsPage.getContent();
        Map<Long, List<Booking>> bookingsByCarId = loadBlockingBookingsByCar(cars, now);

        return carsPage.map(car -> toResponseWithAvailability(
                car,
                now,
                bookingsByCarId.getOrDefault(car.getCarId(), List.of())
        ));
    }
    // Business Logic Methods

    // Fetching Cars by make
    @Transactional(readOnly = true)
    public List<CarResponseDTO> getCarsByMake(String make) {
        log.debug("Fetching cars by make {}", make);
        List<Car> cars = carRepository.findCarByMakeIgnoreCaseWithFeatures(make);
        LocalDateTime now = LocalDateTime.now();
        Map<Long, List<Booking>> bookingsByCarId = loadBlockingBookingsByCar(cars, now);
        return cars.stream()
                .map(car -> toResponseWithAvailability(
                        car,
                        now,
                        bookingsByCarId.getOrDefault(car.getCarId(), List.of())
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CarResponseDTO> getCarsByMakePage(String make, Pageable pageable) {
        Page<Car> carsPage = carRepository.findCarByMakeIgnoreCaseWithFeatures(make, pageable);
        LocalDateTime now = LocalDateTime.now();
        List<Car> cars = carsPage.getContent();
        Map<Long, List<Booking>> bookingsByCarId = loadBlockingBookingsByCar(cars, now);

        return carsPage.map(car -> toResponseWithAvailability(
                car,
                now,
                bookingsByCarId.getOrDefault(car.getCarId(), List.of())
        ));
    }

    // Updating the car (partial update)
    public CarResponseDTO updateStatus(Long id, CarUpdateDTO updateDTO){
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        // Update only fields that are provided
        if (updateDTO.getMake() != null) {
            car.setMake(updateDTO.getMake());
        }

        if (updateDTO.getRegistrationNumber() != null &&
                !updateDTO.getRegistrationNumber().equalsIgnoreCase(car.getRegistrationNumber())) {
            // Business rule: prevent duplicate registration numbers
            if (carRepository.existsByRegistrationNumber(updateDTO.getRegistrationNumber())) {
                throw new RuntimeException("Car with registration number " + updateDTO.getRegistrationNumber() + " already exists");
            }
            car.setRegistrationNumber(updateDTO.getRegistrationNumber());
        }

        if (updateDTO.getVehicleModel() != null) {
            car.setVehicleModel(updateDTO.getVehicleModel());
        }

        if (updateDTO.getYear() != null) {
            validateCarYear(updateDTO.getYear());
            car.setYear(updateDTO.getYear());
        }

        if (updateDTO.getEngineCapacity() != null) {
            if (updateDTO.getEngineCapacity() <= 0) {
                throw new RuntimeException("Engine capacity must be positive");
            }
            car.setEngineCapacity(updateDTO.getEngineCapacity());
        }

        if (updateDTO.getColour() != null) {
            car.setColour(updateDTO.getColour());
        }

        if (updateDTO.getMileage() != null) {
            if (updateDTO.getMileage() < 0) {
                throw new RuntimeException("Mileage cannot be negative");
            }
            car.setMileage(updateDTO.getMileage());
        }

        if (updateDTO.getDailyPrice() != null) {
            if (updateDTO.getDailyPrice() < 1000.0) {
                throw new RuntimeException("Daily price must be at least 1000/= ksh");
            }
            car.setDailyPrice(updateDTO.getDailyPrice());
        }

        if (updateDTO.getSeatingCapacity() != null) {
            car.setSeatingCapacity(updateDTO.getSeatingCapacity());
        }

        if (updateDTO.getCarStatus() != null) {
            car.setCarStatus(updateDTO.getCarStatus());
        }

        if (updateDTO.getTransmissionType() != null) {
            car.setTransmissionType(updateDTO.getTransmissionType());
        }

        if (updateDTO.getFuelType() != null) {
            car.setFuelType(updateDTO.getFuelType());
        }

        if (updateDTO.getBodyType() != null) {
            car.setBodyType(updateDTO.getBodyType());
        }

        if (updateDTO.getFeaturedCategory() != null) {
            car.setFeaturedCategory(updateDTO.getFeaturedCategory());
        }

        if (updateDTO.getDescription() != null) {
            car.setDescription(updateDTO.getDescription());
        }

        // Process feature names if provided
        if (updateDTO.getFeatureName() != null) {
            Set<Feature> features = featureService.processFeatureNames(updateDTO.getFeatureName());
            car.setFeatures(features);
        }

        Car savedCar = carRepository.save(car);
        return toResponseWithAvailability(savedCar, LocalDateTime.now());
    }

    // Update car image/photo
    public CarResponseDTO updateCarImage(Long id, MultipartFile image) {
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        String previousImageUrl = car.getMainImageUrl();

        // Store the new image and update the URL
        String storedFileNameOrUrl = fileStorageService.storeFile(image);
        log.info("Updating image for car {} with: {}", id, storedFileNameOrUrl);

        String imageUrl = storedFileNameOrUrl.startsWith("http")
                ? storedFileNameOrUrl
                : "/api/v1/cars/images/" + storedFileNameOrUrl;
        car.setMainImageUrl(imageUrl);

        Car savedCar = carRepository.save(car);

        if (previousImageUrl != null && !previousImageUrl.equals(imageUrl)) {
            cleanupRemovedImageUrls(List.of(previousImageUrl), id);
        }

        return toResponseWithAvailability(savedCar, LocalDateTime.now());
    }

    // Update car gallery by keeping selected existing URLs and appending new uploaded files.
    public CarResponseDTO updateCarGallery(Long id, List<MultipartFile> images, List<String> existingUrls) {
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        List<String> currentGallery = car.getGalleryImageUrls() != null
                ? car.getGalleryImageUrls()
                : List.of();

        // Keep only URLs that already belong to this car to avoid arbitrary URL injection.
        List<String> retainedUrls = new ArrayList<>();
        if (existingUrls != null) {
            Set<String> allowed = new LinkedHashSet<>(currentGallery);
            retainedUrls = existingUrls.stream()
                    .filter(url -> url != null && !url.isBlank())
                    .filter(allowed::contains)
                    .collect(Collectors.toList());
        }

        List<String> uploadedUrls = (images == null ? List.<MultipartFile>of() : images).stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(fileStorageService::storeFile)
                .map(fileNameOrUrl -> fileNameOrUrl.startsWith("http")
                        ? fileNameOrUrl
                        : "/api/v1/cars/images/" + fileNameOrUrl)
                .collect(Collectors.toList());

        LinkedHashSet<String> finalGallerySet = new LinkedHashSet<>();
        finalGallerySet.addAll(retainedUrls);
        finalGallerySet.addAll(uploadedUrls);
        List<String> finalGalleryUrls = new ArrayList<>(finalGallerySet);
        car.setGalleryImageUrls(finalGalleryUrls);

        List<String> removedUrls = currentGallery.stream()
                .filter(url -> !finalGallerySet.contains(url))
                .collect(Collectors.toList());

        Car savedCar = carRepository.save(car);

        cleanupRemovedImageUrls(removedUrls, id);

        return toResponseWithAvailability(savedCar, LocalDateTime.now());
    }

    public void deleteCar(Long id){
        log.debug("Deleting car with ID: {}", id);
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        List<String> imageUrls = new ArrayList<>();
        if (car.getMainImageUrl() != null && !car.getMainImageUrl().isBlank()) {
            imageUrls.add(car.getMainImageUrl());
        }
        if (car.getGalleryImageUrls() != null && !car.getGalleryImageUrls().isEmpty()) {
            imageUrls.addAll(car.getGalleryImageUrls());
        }

        carRepository.deleteById(id);
        cleanupRemovedImageUrls(imageUrls, id);
    }

    private CarResponseDTO toResponseWithAvailability(Car car, LocalDateTime asOf) {
        return toResponseWithAvailability(car, asOf, null);
    }

    private CarResponseDTO toResponseWithAvailability(Car car, LocalDateTime asOf, List<Booking> preloadedBookings) {
        CarResponseDTO dto = carMapper.toResponseDTO(car);
        applyAvailability(dto, car, asOf, preloadedBookings);
        return dto;
    }

    private void applyAvailability(CarResponseDTO dto, Car car, LocalDateTime asOf, List<Booking> preloadedBookings) {
        dto.setAvailabilityMessage(null);
        dto.setSoftLockExpiresAt(null);
        dto.setNextAvailableAt(null);
        dto.setBlockedFromDate(null);
        dto.setBlockedToDate(null);

        if (car.getCarStatus() == CarStatus.MAINTENANCE) {
            dto.setAvailabilityStatus(CarAvailabilityStatus.MAINTENANCE);
            dto.setAvailabilityMessage("This vehicle is currently under maintenance.");
            return;
        }

        LocalDate today = asOf.toLocalDate();
        List<Booking> carBookings = preloadedBookings != null
                ? preloadedBookings
                : bookingRepository.findByCarCarId(car.getCarId());
        List<Booking> bookedBlocks = carBookings.stream()
                .filter(booking -> isBookedBlocking(booking, today))
                .sorted(
                        Comparator.comparing(booking -> {
                            if (booking.getReturnDate() != null) {
                                return booking.getReturnDate().atStartOfDay();
                            }
                            if (booking.getPickupDate() != null) {
                                return booking.getPickupDate().atStartOfDay();
                            }
                            return LocalDateTime.MAX;
                        })
                )
                .collect(Collectors.toList());
        List<Booking> softLockBlocks = carBookings.stream()
                .filter(booking -> isSoftLockBlocking(booking, asOf))
                .sorted(Comparator.comparing(Booking::getPaymentExpiresAt))
                .collect(Collectors.toList());

        if (bookedBlocks.isEmpty() && softLockBlocks.isEmpty()) {
            if (car.getCarStatus() == CarStatus.RENTED) {
                dto.setAvailabilityStatus(CarAvailabilityStatus.BOOKED);
                dto.setAvailabilityMessage("This vehicle is currently in an active rental.");
                return;
            }

            dto.setAvailabilityStatus(CarAvailabilityStatus.AVAILABLE);
            dto.setAvailabilityMessage("Available for booking.");
            return;
        }

        Booking blocker = !bookedBlocks.isEmpty() ? bookedBlocks.get(0) : softLockBlocks.get(0);
        dto.setBlockedFromDate(blocker.getPickupDate());
        dto.setBlockedToDate(blocker.getReturnDate());

        if (isSoftLockBlocking(blocker, asOf)) {
            dto.setAvailabilityStatus(CarAvailabilityStatus.SOFT_LOCKED);
            dto.setSoftLockExpiresAt(blocker.getPaymentExpiresAt());
            dto.setNextAvailableAt(blocker.getPaymentExpiresAt());
            dto.setAvailabilityMessage(
                    "This vehicle is temporarily reserved while another customer completes payment."
            );
            return;
        }

        dto.setAvailabilityStatus(CarAvailabilityStatus.BOOKED);
        if (blocker.getReturnDate() != null) {
            dto.setNextAvailableAt(blocker.getReturnDate().atStartOfDay());
            dto.setAvailabilityMessage(
                    "This vehicle is booked from " + blocker.getPickupDate() + " to " + blocker.getReturnDate() + "."
            );
        } else {
            dto.setAvailabilityMessage("This vehicle is currently booked.");
        }
    }

    private boolean isSoftLockBlocking(Booking booking, LocalDateTime asOf) {
        return booking != null
                && SOFT_LOCK_STATUSES.contains(booking.getBookingStatus())
                && SOFT_LOCK_PAYMENT_STATUSES.contains(booking.getPaymentStatus())
                && booking.getPaymentExpiresAt() != null
                && booking.getPaymentExpiresAt().isAfter(asOf);
    }

    private boolean isBookedBlocking(Booking booking, LocalDate today) {
        if (booking == null || !BOOKED_STATUSES.contains(booking.getBookingStatus())) {
            return false;
        }

        if (booking.getReturnDate() == null) {
            return true;
        }

        return !booking.getReturnDate().isBefore(today);
    }

    private void validateCarYear(int carYear) {
        int currentYear = LocalDate.now().getYear();

        if (carYear > currentYear) {
            throw new RuntimeException("Car year cannot be in the future");
        }

        if (carYear < currentYear - 30) {
            throw new RuntimeException("We do not take cars over 30 years old");
        }
    }

    private void cleanupRemovedImageUrls(List<String> imageUrls, Long currentCarId) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        LinkedHashSet<String> uniqueUrls = imageUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        for (String imageUrl : uniqueUrls) {
            if (isImageReferencedByOtherCars(imageUrl, currentCarId)) {
                log.debug("Skipping delete for image still referenced by another car: {}", imageUrl);
                continue;
            }
            deleteImageByUrl(imageUrl);
        }
    }

    private boolean isImageReferencedByOtherCars(String imageUrl, Long currentCarId) {
        Long excludedCarId = currentCarId != null ? currentCarId : -1L;
        return carRepository.existsByMainImageUrlAndCarIdNot(imageUrl, excludedCarId)
                || carRepository.existsGalleryImageReference(imageUrl, excludedCarId);
    }

    private Map<Long, List<Booking>> loadBlockingBookingsByCar(List<Car> cars, LocalDateTime asOf) {
        if (cars == null || cars.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> carIds = cars.stream()
                .map(Car::getCarId)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        if (carIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return bookingRepository.findBlockingBookingsForCars(carIds, asOf.toLocalDate(), asOf).stream()
                .filter(booking -> booking.getCar() != null && booking.getCar().getCarId() != null)
                .collect(Collectors.groupingBy(booking -> booking.getCar().getCarId()));
    }

    private void deleteImageByUrl(String imageUrl) {
        try {
            String fileName = extractLocalFileName(imageUrl);
            if (fileName == null) {
                // Non-local URLs (e.g. cloud storage URLs) - try Cloudinary delete
                if (imageUrl != null && imageUrl.contains("cloudinary.com")) {
                    fileStorageService.deleteFile(imageUrl);
                } else {
                    log.debug("Skipping storage delete for non-local image URL: {}", imageUrl);
                }
                return;
            }

            fileStorageService.deleteFile(fileName);
        } catch (Exception e) {
            // Log but don't fail the operation if image cleanup fails
            log.warn("Failed to delete image file (this is non-critical): {}", imageUrl, e);
        }
    }

    private String extractLocalFileName(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(LOCAL_IMAGE_PREFIX)) {
            return null;
        }

        String fileName = imageUrl.substring(LOCAL_IMAGE_PREFIX.length()).trim();
        if (fileName.isEmpty()) {
            return null;
        }

        return fileName;
    }

}
