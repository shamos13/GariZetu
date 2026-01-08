package com.amos.garizetu.Repository;

import com.amos.garizetu.Car.Entity.Feature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface FeatureRepository extends JpaRepository<Feature, Long> {

    Optional<Feature> findByFeatureName(String name);

    Set<Feature> findByFeatureCategory(String category);

    boolean existsByFeatureName(String featureName);

}
