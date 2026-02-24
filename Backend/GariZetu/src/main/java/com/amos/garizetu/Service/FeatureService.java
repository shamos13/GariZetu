package com.amos.garizetu.Service;


// This file lets us find or create a new feature ###Hybrid approach

import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Repository.FeatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureService {

    private final FeatureRepository featureRepository;


    @Transactional
    public Feature findOrCreateFeature(String featureName) {
        return featureRepository.findByFeatureName(featureName)
                .orElseGet(() ->{
                    Feature newFeature = new Feature();
                    newFeature.setFeatureName(featureName);
                    newFeature.setFeatureDescription("");
                    newFeature.setFeatureCategory("GENERAL");
                    return featureRepository.save(newFeature);
                });
    }

    //Process a list of Feature names
    @Transactional
    public Set<Feature> processFeatureNames(List<String> featureNames) {
        if (featureNames == null || featureNames.isEmpty()) {
            return Set.of();
        }

        Set<String> normalizedNames = featureNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        if (normalizedNames.isEmpty()) {
            return Set.of();
        }

        List<Feature> existingFeatures = featureRepository.findByFeatureNameIn(normalizedNames);
        Set<String> existingNames = existingFeatures.stream()
                .map(Feature::getFeatureName)
                .collect(Collectors.toSet());

        List<Feature> missingFeatures = normalizedNames.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> {
                    Feature newFeature = new Feature();
                    newFeature.setFeatureName(name);
                    newFeature.setFeatureDescription("");
                    newFeature.setFeatureCategory("GENERAL");
                    return newFeature;
                })
                .collect(Collectors.toList());

        if (!missingFeatures.isEmpty()) {
            existingFeatures.addAll(featureRepository.saveAll(missingFeatures));
        }

        return new LinkedHashSet<>(existingFeatures);
    }

    // Get all available features for frontend dropdown
    public List<Feature> getAllFeatures() {
        return featureRepository.findAll();
    }

    //Get features by Category
    public Set<Feature> getFeaturesByCategory(String featureCategory) {
        return featureRepository.findByFeatureCategory(featureCategory);
    }
}
