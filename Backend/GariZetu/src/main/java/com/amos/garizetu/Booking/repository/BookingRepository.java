package com.amos.garizetu.Booking.repository;

import com.amos.garizetu.Booking.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ========= BASIC QUERIES ==========
    List<Booking> findByUserId(Long userId);

    List<Booking> findByCarId(Long carId);

    List<Booking> findByBookingStatus(String bookingStatus);

    List<Booking> findByUserIdAndBookingStatus(Long userId, String bookingStatus);

}
