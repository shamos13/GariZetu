package com.amos.garizetu.Repository;

import com.amos.garizetu.Car.Entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    //Check if registration number exists
    boolean existsByRegistrationNumber(String registrationNumber);

    // Get cars by brand(make)
    List<Car> findCarByMakeIgnoreCase(String make);


}
