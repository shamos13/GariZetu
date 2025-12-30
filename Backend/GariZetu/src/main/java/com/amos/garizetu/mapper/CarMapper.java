package com.amos.garizetu.mapper;

import com.amos.garizetu.DTO.Request.CarCreateRequest;
import com.amos.garizetu.DTO.Response.CarResponseDTO;
import com.amos.garizetu.Entity.Car;
import org.springframework.stereotype.Component;

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
        car.setCarStatus(dto.getCarStatus());
        car.setTransmissionType(dto.getTransmissionType());
        car.setFuelType(dto.getFuelType());

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
        carResponseDTO.setCarStatus(car.getCarStatus());
        carResponseDTO.setTransmissionType(car.getTransmissionType());
        carResponseDTO.setFuelType(car.getFuelType());
        carResponseDTO.setCreatedAt(car.getCreatedAt());
        carResponseDTO.setUpdatedAt(car.getUpdatedAt());

        return carResponseDTO;
    }
}
