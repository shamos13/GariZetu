package com.amos.garizetu.Service;

import com.amos.garizetu.Car.DTO.Request.CarCreateRequest;
import com.amos.garizetu.Car.DTO.Request.CarUpdateDTO;
import com.amos.garizetu.Car.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FeaturedCategory;
import com.amos.garizetu.Repository.CarRepository;
import com.amos.garizetu.Car.mapper.CarMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final FileStorageService fileStorageService;
    private final FeatureService featureService;


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

        //Store the image first and get the file name
        String storedFileName = fileStorageService.storeFile(carCreateRequest.getImage());
        log.info("Storing image for file {}", storedFileName);

        //Build image Url that will be stored in the db
        String imageUrl = "/api/v1/cars/images/" + storedFileName;

        Car car = carMapper.toEntity(carCreateRequest);
        car.setMainImageUrl(imageUrl);

        // Store gallery images if provided
        if (carCreateRequest.getGalleryImages() != null && !carCreateRequest.getGalleryImages().isEmpty()) {
            List<String> galleryUrls = carCreateRequest.getGalleryImages().stream()
                    .filter(file -> file != null && !file.isEmpty())
                    .map(fileStorageService::storeFile)
                    .map(fileName -> "/api/v1/cars/images/" + fileName)
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

        return carMapper.toResponseDTO(savedCar);


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
    public CarResponseDTO getCarById(Long id) {
        log.debug("Fetching car with ID: {}", id);
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));
        log.debug("Car {} has {} features", id, car.getFeatures() != null ? car.getFeatures().size() : 0);
        return carMapper.toResponseDTO(car);
    }

    //Fetch all Cars
    public List<CarResponseDTO> getAllCars(){
        log.debug("Fetching all cars");
        List<Car> cars = carRepository.findAllWithFeatures();
        log.debug("Fetched {} cars", cars.size());
        return cars.stream()
                .map(carMapper::toResponseDTO)
                .collect(Collectors.toList());

    }
    // Business Logic Methods

    // Fetching Cars by make
    public List<CarResponseDTO> getCarsByMake(String make) {
        log.debug("Fetching cars by make {}", make);
        List<Car> cars = carRepository.findCarByMakeIgnoreCaseWithFeatures(make);
        return cars.stream().map(carMapper::toResponseDTO).collect(Collectors.toList());
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
        return carMapper.toResponseDTO(savedCar);
    }

    // Update car image/photo
    public CarResponseDTO updateCarImage(Long id, MultipartFile image) {
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        // Store the new image and update the URL
        String storedFileName = fileStorageService.storeFile(image);
        log.info("Updating image for car {} with file {}", id, storedFileName);

        String imageUrl = "/api/v1/cars/images/" + storedFileName;
        car.setMainImageUrl(imageUrl);

        Car savedCar = carRepository.save(car);
        return carMapper.toResponseDTO(savedCar);
    }

    // Replace car gallery images
    public CarResponseDTO updateCarGallery(Long id, List<MultipartFile> images) {
        Car car = carRepository.findByIdWithFeatures(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));

        if (images == null || images.isEmpty()) {
            throw new RuntimeException("Gallery images are required");
        }

        List<String> galleryUrls = images.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(fileStorageService::storeFile)
                .map(fileName -> "/api/v1/cars/images/" + fileName)
                .collect(Collectors.toList());
        car.setGalleryImageUrls(galleryUrls);

        Car savedCar = carRepository.save(car);
        return carMapper.toResponseDTO(savedCar);
    }

    public void deleteCar(Long id){
        log.debug("Deleting car with ID: {}", id);
        if(!carRepository.existsById(id)){
            throw  new RuntimeException("Car with ID " + id + " not found");
        }
        carRepository.deleteById(id);
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

}
