package com.amos.garizetu.Car.Controller;

import com.amos.garizetu.Car.DTO.Request.CarCreateRequest;
import com.amos.garizetu.Car.DTO.Request.CarUpdateDTO;
import com.amos.garizetu.Car.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Service.CarService;
import com.amos.garizetu.Service.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/cars")
public class CarController {

    private final CarService carService;
    private final FileStorageService fileStorageService;


    /**
     * ENDPOINT 1: Upload (Admin)
     * Creates a new car with image upload
     */


    @PostMapping(value="/admin/create-car", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CarResponseDTO> createCar(
            @Valid @ModelAttribute CarCreateRequest carCreateRequest) {
        log.info("Admin creating a new car with image upload");
        CarResponseDTO createdCar = carService.createCar(carCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCar);
    }

    /**
     * ENDPOINT 2: Retrieve Image
     * Serves the car image file to clients
     *
     * This is the "bridge" endpoint you identified - it retrieves files
     * from local storage and sends them over the internet
     *
     * Example: GET /api/v1/cars/images/550e8400-e29b-41d4-a801-1a2b3c4d5e6f.jpg
     *
     * Returns the raw image bytes with appropriate Content-Type header
     */
    @GetMapping("images/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName) {
        log.info("Getting image for file {}", fileName);

        try {
            // Load the file as a resource
            Resource resource = fileStorageService.loadFileAsResource(fileName);

            // Determine the content type based on file extension
            String contentType = determineContentType(fileName);
            //Return the image with appropriate headers
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" +fileName + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            log.warn("Image file not found: {}", fileName);
            return ResponseEntity.notFound().build();
        }
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

    // Updating car in patches (partial update of selected fields)
    @PatchMapping("/{id}")
    public ResponseEntity<CarResponseDTO> updateCar(@PathVariable Long id, @RequestBody CarUpdateDTO updateDTO) {
        CarResponseDTO updatedCar = carService.updateStatus(id, updateDTO);
        return ResponseEntity.ok(updatedCar);
    }

    // Update only the car image/photo
    @PatchMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CarResponseDTO> updateCarImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image
    ) {
        CarResponseDTO updatedCar = carService.updateCarImage(id, image);
        return ResponseEntity.ok(updatedCar);
    }

    // Replace car gallery images
    @PatchMapping(value = "/{id}/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CarResponseDTO> updateCarGallery(
            @PathVariable Long id,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "existingUrls", required = false) List<String> existingUrls
    ) {
        CarResponseDTO updatedCar = carService.updateCarGallery(id, images, existingUrls);
        return ResponseEntity.ok(updatedCar);
    }
    @DeleteMapping({"/{id}"})
    public ResponseEntity<Void> deleteCarById(@PathVariable("id") Long carId) {
        carService.deleteCar(carId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Helper method to determine content type from file extension
     * This ensures browsers render images correctly
     */
    private String determineContentType(String fileName) {
        if (fileName.endsWith(".png")) {
            return "image/png";
        } else if (fileName.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "image/jpeg"; // Default to JPEG
        }
    }
}
