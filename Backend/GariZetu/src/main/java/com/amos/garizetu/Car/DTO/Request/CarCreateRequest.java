package com.amos.garizetu.Car.DTO.Request;

import com.amos.garizetu.Car.Enums.BodyType;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FuelType;
import com.amos.garizetu.Car.Enums.TransmissionType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarCreateRequest {

    @NotBlank(message = "make is required")
    @Size(min =2, max =50, message = "Make must be between 2 - 50 characters")
    private String make;

    //@Pattern(regexp = "^[A-Z]{2}\\d{3}[A-Z]{2}$",
      //      message = "Invalid registration format (e.g., KBC123A)")
    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "model is required")
    private String vehicleModel;

    @Min(value = 2009, message = "Year must be after 2009")
    @Max(value = 2025, message = "Year cannot be in the future")
    private int year;

    @Positive(message = "Engine capacity must be positive")
    private int engineCapacity;

    @NotBlank(message = "Colour is required") //Not Blank is only suitable for values that are STRING
    private String colour;

    @Min(value=0, message = "Mileage cannot be negative")
    private int mileage;

    @DecimalMin(value = "1000.0", message = "Daily price must be at least 1000/= ksh")
    private double dailyPrice;

    @NotNull(message = "make is required")
    private int seatingCapacity;

    @NotNull(message = "Transmission type is required")
    private TransmissionType transmissionType;

    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;

    @NotNull(message = "Body type can not be blank")
    private BodyType bodyType;

    @NotNull(message = "Car Status is required")
    private CarStatus carStatus;

    // Can be blank
    private MultipartFile image;

    //Website Display Fields
    @Size(min =10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    private List<String> featureName;


}
