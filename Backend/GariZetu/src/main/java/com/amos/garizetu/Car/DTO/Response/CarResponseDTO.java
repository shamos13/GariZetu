package com.amos.garizetu.Car.DTO.Response;

import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FuelType;
import com.amos.garizetu.Car.Enums.TransmissionType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CarResponseDTO {
    private Long carId;
    private String make;
    private String registrationNumber;
    private String vehicleModel;
    private int year;
    private int engineCapacity;
    private String colour;
    private int mileage;
    private double dailyPrice;
    private int seatingCapacity;
    private String mainImageUrl;
    private CarStatus carStatus;
    private TransmissionType transmissionType;
    private FuelType fuelType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
