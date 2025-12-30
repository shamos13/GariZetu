package com.amos.garizetu.Service;

import com.amos.garizetu.DTO.Request.CarCreateRequest;
import com.amos.garizetu.DTO.Request.CarUpdateDTO;
import com.amos.garizetu.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Entity.Car;
import com.amos.garizetu.Enums.CarStatus;
import com.amos.garizetu.Repository.CarRepository;
import com.amos.garizetu.mapper.CarMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final FileStorageService fileStorageService;

    //Create a new car with image upload
    public CarResponseDTO createCar(CarCreateRequest carCreateRequest) {
        log.info("Create a new car with registration: {}", carCreateRequest.getRegistrationNumber());

        //Business rule 1: Check Duplicate registration
        if (carRepository.existsByRegistrationNumber(carCreateRequest.getRegistrationNumber())){
            throw  new RuntimeException("Car with registration number " + carCreateRequest.getRegistrationNumber() + " already exists");
        }

        //Store the image first and get the file name
        String storedFileName = fileStorageService.storeFile(carCreateRequest.getImage());
        log.info("Storing image for file {}", storedFileName);

        //Build image Url that will be stored in the db
        String imageUrl = "/api/v1/cars/images/" + storedFileName;

        Car car = carMapper.toEntity(carCreateRequest);
        car.setMainImageUrl(imageUrl);

        //Business rule 2: Validate car year
        validateCarYear(carCreateRequest.getYear());


        //Business rule 3: New cars should default to available if not Specified
        if (car.getCarStatus()==null){
            car.setCarStatus(CarStatus.AVAILABLE);
        }

        //Save to database
        Car savedCar = carRepository.save(car);
        log.info("Car created successfully with ID: {}",savedCar.getCarId());

        return carMapper.toResponseDTO(savedCar);

    }

    // Reading the Response

    //Reading a single response
    public CarResponseDTO getCarById(Long id) {
        log.debug("Fetching car with ID: {}", id);
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));
        return carMapper.toResponseDTO(car);
    }

    //Fetch all Cars
    public List<CarResponseDTO> getAllCars(){
        log.debug("Fetching all cars");
        List<Car> cars = carRepository.findAll();
        return cars.stream()
                .map(carMapper::toResponseDTO)
                .collect(Collectors.toList());

    }
    // Business Logic Methods

    // Fetching Cars by make
    public List<CarResponseDTO> getCarsByMake(String make) {
        log.debug("Fetching cars by make {}", make);
        List<Car> cars = carRepository.findCarByMakeIgnoreCase(make);
        return cars.stream().map(carMapper::toResponseDTO).collect(Collectors.toList());
    }

    //Updating the car
    public CarResponseDTO updateStatus(Long id, CarUpdateDTO updateDTO){
        Car car = carRepository.findById(id).orElseThrow(() -> new RuntimeException("Car with ID " + id + " not found"));
        car.setCarStatus(updateDTO.getCarStatus());

        if (updateDTO.getDailyPrice()==0){
            car.setDailyPrice(car.getDailyPrice());
        }
        else {
            car.setDailyPrice(updateDTO.getDailyPrice());
        }
        return carMapper.toResponseDTO(carRepository.save(car));

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
