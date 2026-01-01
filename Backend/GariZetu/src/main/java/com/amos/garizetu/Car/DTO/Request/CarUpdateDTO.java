package com.amos.garizetu.Car.DTO.Request;

import com.amos.garizetu.Car.Enums.CarStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CarUpdateDTO {

    @NotBlank(message = "Car Status is not Empty")
    private CarStatus carStatus;
    private double dailyPrice;
}
