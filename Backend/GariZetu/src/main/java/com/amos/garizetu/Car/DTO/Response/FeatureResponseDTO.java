package com.amos.garizetu.Car.DTO.Response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeatureResponseDTO {
    private Long featureId;
    private String featureName;
    private String featureDescription;
    private String featureCategory;
    private boolean available; //For frontend is this feature available for this car
}
