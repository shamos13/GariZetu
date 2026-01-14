package com.amos.garizetu.Car.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "features")
public class Feature {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="feature_id")
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

    //Re-solving the concurrent modification
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Feature)) return false;
        Feature feature = (Feature) o;
        return featureId != null && featureId.equals(feature.featureId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

}

