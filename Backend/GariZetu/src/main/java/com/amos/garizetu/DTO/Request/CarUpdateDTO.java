package com.amos.garizetu.DTO.Request;

import com.amos.garizetu.Enums.CarStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CarUpdateDTO {

    @NotBlank(message = "Car Status is not Empty")
    private CarStatus carStatus;
    private double dailyPrice;
}
