package com.amos.garizetu.Car.Controller;

import com.amos.garizetu.Car.DTO.Response.FeatureResponseDTO;
import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Service.FeatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/v1/features")
@RequiredArgsConstructor
@Slf4j
public class FeatureController {
    private final FeatureService featureService;

    /*
    * Get all available features
    * GET /api/v1/features
    *
    * Use Case: FrontEnd loads this list for the feature selection dropdown
    */

    @GetMapping
    public ResponseEntity<List<FeatureResponseDTO>> getAllFeatures() {
        log.info("Fetching all features");

        List<FeatureResponseDTO> features = featureService.getAllFeatures().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(features);
    }

    //Get features by category e.g.
    // GET /api/v1/features?category=SAFETY...use case: organized display feature in Admin panel
    @GetMapping(params = "category")
    public ResponseEntity<List<FeatureResponseDTO>> getAllFeatureByCategory(@RequestParam String category){
        log.info("Fetching features by category: {}", category);

        List<FeatureResponseDTO> features = featureService.getFeaturesByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(features);
    }

    // A sample mapper (for testing I will move this to its own when its working)
    private FeatureResponseDTO toDTO(Feature feature) {
        FeatureResponseDTO dto = new FeatureResponseDTO();
        dto.setFeatureId(feature.getFeatureId());
        dto.setFeatureName(feature.getFeatureName());
        dto.setFeatureDescription(feature.getFeatureDescription());
        dto.setFeatureCategory(feature.getFeatureCategory());
        dto.setAvailable(true);
        return dto;
    }
}
