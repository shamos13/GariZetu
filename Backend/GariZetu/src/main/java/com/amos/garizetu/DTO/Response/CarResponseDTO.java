package com.amos.garizetu.DTO.Response;

import com.amos.garizetu.Enums.CarStatus;
import com.amos.garizetu.Enums.FuelType;
import com.amos.garizetu.Enums.TransmissionType;
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
    private CarStatus carStatus;
    private TransmissionType transmissionType;
    private FuelType fuelType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
