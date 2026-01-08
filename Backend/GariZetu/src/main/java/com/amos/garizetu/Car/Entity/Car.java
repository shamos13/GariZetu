package com.amos.garizetu.Car.Entity;

import com.amos.garizetu.Car.Enums.BodyType;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Car.Enums.FuelType;
import com.amos.garizetu.Car.Enums.TransmissionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long carId;
    private String make;

    @Column(unique = true, nullable = false)
    private String registrationNumber;
    private String vehicleModel;
    private int year;
    private int engineCapacity;
    private String colour;
    private int mileage;
    private double dailyPrice;
    private int seatingCapacity;
    private String mainImageUrl;//Added a url to upload images


    @Enumerated(EnumType.STRING)
    @Column(name = "car_status", nullable = false)
    private CarStatus carStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "transmission_type", nullable = false)
    private TransmissionType transmissionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false)
    private FuelType fuelType;

    //New fields
    @Enumerated(EnumType.STRING)
    @Column(name = "body_type")
    private BodyType bodyType;

    // Implementing the many to many relationship
    @ManyToMany(cascade = {CascadeType.PERSIST ,CascadeType.MERGE})
    @JoinTable(
            name = "features",
            joinColumns = @JoinColumn(name = "car_id"),
            inverseJoinColumns = @JoinColumn(name = "feature_id")
    )
    private Set<Feature> features = new HashSet<>();

    // Helper methods for managing features
    public void addFeature(Feature feature) {
        features.add(feature);
        feature.getCars().add(this);
    }

    public void removeFeature(Feature feature) {
        features.remove(feature);
        feature.getCars().remove(this);
    }

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }






}
