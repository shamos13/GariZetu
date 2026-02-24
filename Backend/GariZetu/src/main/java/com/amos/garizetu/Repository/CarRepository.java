package com.amos.garizetu.Repository;

import com.amos.garizetu.Car.Entity.Car;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarRepository extends JpaRepository<Car, Long> {
    //Check if registration number exists
    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByMainImageUrlAndCarIdNot(String mainImageUrl, Long carId);

    // Get cars by brand(make)
    List<Car> findCarByMakeIgnoreCase(String make);

    // Fetch car with features eagerly loaded
    @EntityGraph(attributePaths = {"features"})
    @Query("SELECT c FROM Car c WHERE c.carId = :id")
    Optional<Car> findByIdWithFeatures(@Param("id") Long id);

    // Fetch all cars with features eagerly loaded
    @EntityGraph(attributePaths = {"features"})
    @Query("SELECT c FROM Car c")
    List<Car> findAllWithFeatures();

    // Fetch cars by make with features eagerly loaded
    @EntityGraph(attributePaths = {"features"})
    @Query("SELECT c FROM Car c WHERE LOWER(c.make) = LOWER(:make)")
    List<Car> findCarByMakeIgnoreCaseWithFeatures(@Param("make") String make);

    @Query(value = "SELECT EXISTS (" +
            "SELECT 1 FROM car_gallery_images cgi " +
            "WHERE cgi.image_url = :imageUrl " +
            "AND cgi.car_id <> :currentCarId)", nativeQuery = true)
    boolean existsGalleryImageReference(
            @Param("imageUrl") String imageUrl,
            @Param("currentCarId") Long currentCarId
    );
}
