package com.amos.garizetu.Car.DTO.Request;

import com.amos.garizetu.Car.Enums.BodyType;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FeaturedCategory;
import com.amos.garizetu.Car.Enums.FuelType;
import com.amos.garizetu.Car.Enums.TransmissionType;
import lombok.Data;

import java.util.List;

@Data
public class CarUpdateDTO {

    /**
     * All fields are optional to support partial updates.
     * Only non-null values will be applied in the service layer.
     */
    private String make;
    private String registrationNumber;
    private String vehicleModel;
    private Integer year;
    private Integer engineCapacity;
    private String colour;
    private Integer mileage;
    private Double dailyPrice;
    private Integer seatingCapacity;
    private CarStatus carStatus;
    private TransmissionType transmissionType;
    private FuelType fuelType;
    private BodyType bodyType;
    private FeaturedCategory featuredCategory;
    private String description;
    private List<String> featureName;
}
