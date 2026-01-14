package com.amos.garizetu.Car.mapper;

import com.amos.garizetu.Car.DTO.Request.CarCreateRequest;
import com.amos.garizetu.Car.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Car.DTO.Response.FeatureResponseDTO;
import com.amos.garizetu.Car.Entity.Car;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CarMapper {

    //Converting Car to a createRequest DTO
    public Car toEntity(CarCreateRequest dto){
        if (dto == null) {
            return null;
        }

        Car car = new Car();
        car.setMake(dto.getMake());
        car.setRegistrationNumber(dto.getRegistrationNumber());
        car.setVehicleModel(dto.getVehicleModel());
        car.setYear(dto.getYear());
        car.setEngineCapacity(dto.getEngineCapacity());
        car.setColour(dto.getColour());
        car.setMileage(dto.getMileage());
        car.setDailyPrice(dto.getDailyPrice());
        car.setSeatingCapacity(dto.getSeatingCapacity());
        car.setDescription(dto.getDescription());
        car.setCarStatus(dto.getCarStatus());
        car.setTransmissionType(dto.getTransmissionType());
        car.setFuelType(dto.getFuelType());
        car.setBodyType(dto.getBodyType());

        return car;
    }

    //Converting car to a response DTO
    public CarResponseDTO toResponseDTO(Car car){
        if (car == null) {
            return null;
        }

        CarResponseDTO carResponseDTO = new CarResponseDTO();
        carResponseDTO.setCarId(car.getCarId());
        carResponseDTO.setMake(car.getMake());
        carResponseDTO.setRegistrationNumber(car.getRegistrationNumber());
        carResponseDTO.setVehicleModel(car.getVehicleModel());
        carResponseDTO.setYear(car.getYear());
        carResponseDTO.setEngineCapacity(car.getEngineCapacity());
        carResponseDTO.setColour(car.getColour());
        carResponseDTO.setMileage(car.getMileage());
        carResponseDTO.setDailyPrice(car.getDailyPrice());
        carResponseDTO.setSeatingCapacity(car.getSeatingCapacity());
        carResponseDTO.setMainImageUrl(car.getMainImageUrl());
        carResponseDTO.setDescription(car.getDescription());
        carResponseDTO.setCarStatus(car.getCarStatus());
        carResponseDTO.setTransmissionType(car.getTransmissionType());
        carResponseDTO.setFuelType(car.getFuelType());
        carResponseDTO.setBodyType(car.getBodyType());


        //Map FEATURES to DTO - always set features list (even if empty)
        List<FeatureResponseDTO> features = new java.util.ArrayList<>();
        if (car.getFeatures() != null && !car.getFeatures().isEmpty()) {
            features = car.getFeatures().stream()
                    .map(feature -> {
                        FeatureResponseDTO featureResponseDTO = new FeatureResponseDTO();
                        featureResponseDTO.setFeatureId(feature.getFeatureId());
                        featureResponseDTO.setFeatureName(feature.getFeatureName());
                        featureResponseDTO.setFeatureDescription(feature.getFeatureDescription());
                        featureResponseDTO.setFeatureCategory(feature.getFeatureCategory());
                        featureResponseDTO.setAvailable(true);
                        return featureResponseDTO;
                    })
                    .collect(Collectors.toList());
        }
        carResponseDTO.setFeatures(features);

        carResponseDTO.setCreatedAt(car.getCreatedAt());
        carResponseDTO.setUpdatedAt(car.getUpdatedAt());

        return carResponseDTO;
    }
}
