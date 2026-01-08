package com.amos.garizetu.Car.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "features")
public class Feature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long featureId;

    @Column(name = "feature_name", unique = true, nullable = false)
    private String featureName;

    @Column(name = "feature_description")
    private String featureDescription;

    @Column(name = "feature_category", nullable = false)
    private String featureCategory;

    // Many features can be associated with many cars
    @ManyToMany(mappedBy = "features")
    private Set<Car> cars = new HashSet<>();

}

