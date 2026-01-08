package com.amos.garizetu.Service;


// This file lets us find or create a new feature ###Hybrid approach

import com.amos.garizetu.Car.Entity.Feature;
import com.amos.garizetu.Repository.FeatureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        Set<Feature> features = new HashSet<>();
        for (String name : featureNames) {
            if (name != null && !name.trim().isEmpty()) {
                Feature feature = findOrCreateFeature(name.trim());
                features.add(feature);
            }
        }
        return features;
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
