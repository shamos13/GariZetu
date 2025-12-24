package com.amos.garizetu.Controller;

import com.amos.garizetu.DTO.Request.CarCreateRequest;
import com.amos.garizetu.DTO.Request.CarUpdateDTO;
import com.amos.garizetu.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/cars")
public class CarController {

    private final CarService carService;

    // Adding Cars to the Database
    @PostMapping("/admin/create-car")
    public ResponseEntity<CarResponseDTO> createCar(
            @Valid @RequestBody CarCreateRequest carCreateRequest) {
        log.info("Admin creating a new car");
        CarResponseDTO createdCar = carService.createCar(carCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCar);
    }

    //Get all Cars
    @GetMapping("/getcars")
    public ResponseEntity<List<CarResponseDTO>> getAllCars() {
        List<CarResponseDTO> cars = carService.getAllCars();
        return ResponseEntity.ok(cars);
    }

    //Retrieving a car by ID
    @GetMapping("/{id}")
    public ResponseEntity<CarResponseDTO> getCarById(@PathVariable("id") Long carId) {
        CarResponseDTO carResponseDTO = carService.getCarById(carId);
        return ResponseEntity.ok(carResponseDTO);
    }

    //Retrieving a car by make
    @GetMapping()
    public ResponseEntity<List<CarResponseDTO>> getCarByMake(@RequestParam(required = false) String make) {
        List<CarResponseDTO> cars = carService.getCarsByMake(make);
        return ResponseEntity.ok(cars);
    }


    // Updating specific fields only
    @PatchMapping("/{id}/status")
    public ResponseEntity<CarResponseDTO> updateCar(@PathVariable Long id, @RequestBody CarUpdateDTO updateDTO) {
        CarResponseDTO updatedCar = carService.updateStatus(id, updateDTO);
        return ResponseEntity.ok(updatedCar);
    }
    @DeleteMapping({"/{id}"})
    public ResponseEntity<Void> deleteCarById(@PathVariable("id") Long carId) {
        carService.deleteCar(carId);
        return ResponseEntity.noContent().build();
    }
}
