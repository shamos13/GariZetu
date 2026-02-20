package com.amos.garizetu.Booking.repository;

import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Booking.Enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ========= BASIC QUERIES ==========
    List<Booking> findByUserUserId(Long userId);

    List<Booking> findByCarCarId(Long carId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    List<Booking> findByUserUserIdAndBookingStatus(Long userId, BookingStatus status);

    /**
     * Find bookings for specific car and status
     * Use: "Check car availability" (check for ACTIVE/CONFIRMED bookings)
     * SQL: SELECT * FROM bookings
     *      WHERE car_id = :carId AND booking_status = :status
     */
    List<Booking> findByCarCarIdAndBookingStatus(Long carId, BookingStatus status);

    // ========== COMPLEX QUERY: AVAILABILITY CHECK ==========

    /**
     * Find CONFLICTING bookings for a car during date range
     *
     * Purpose: Check if car is available for requested dates
     *
     * Logic:
     * - Only look at active bookings (exclude COMPLETED/CANCELLED)
     * - Check if date ranges overlap:
     *   Existing: Mon-Fri
     *   Request:   Tue-Wed  → CONFLICT (overlap)
     *   Request:   Sat-Sun  → OK (no overlap)
     *
     * Implementation: A booking overlaps if:
     * - Existing pickup < requested return (existing starts before request ends)
     * - AND existing return > requested pickup (existing ends after request starts)
     *
     * SQL:
     * SELECT * FROM bookings
     * WHERE car_id = :carId
     *   AND booking_status NOT IN ('COMPLETED', 'CANCELLED')
     *   AND pickup_date < :returnDate
     *   AND return_date > :pickupDate
     */
    @Query("SELECT b FROM Booking b WHERE b.car.carId = :carId " +
            "AND b.bookingStatus NOT IN ('COMPLETED', 'CANCELLED') " +
            "AND b.pickupDate < :returnDate " +
            "AND b.returnDate > :pickupDate")
    List<Booking> findConflictingBookings(
            @Param("carId") Long carId,
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate
    );

    // ========== TEMPORAL QUERIES ==========

    /**
     * Find upcoming bookings (within next N days)
     * Use: "What cars need to be ready tomorrow?"
     * SQL: SELECT * FROM bookings
     *      WHERE booking_status = 'CONFIRMED'
     *      AND pickup_date BETWEEN :today AND :endDate
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'CONFIRMED' " +
            "AND b.pickupDate BETWEEN :startDate AND :endDate")
    List<Booking> findUpcomingBookings(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find active rentals today
     * Use: "Which cars are currently rented?"
     * SQL: SELECT * FROM bookings
     *      WHERE booking_status = 'ACTIVE'
     *      AND pickup_date <= :today
     *      AND return_date > :today
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'ACTIVE' " +
            "AND b.pickupDate <= :today " +
            "AND b.returnDate > :today")
    List<Booking> findActiveBookingsToday(@Param("today") LocalDate today);

    /**
     * Find overdue bookings (not returned yet)
     * Use: "Which cars should have been returned by now?"
     * SQL: SELECT * FROM bookings
     *      WHERE booking_status = 'ACTIVE'
     *      AND return_date < :today
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'ACTIVE' " +
            "AND b.returnDate < :today")
    List<Booking> findOverdueBookings(@Param("today") LocalDate today);

    // ========== STATISTICS QUERIES ==========

    /**
     * Count bookings by status
     * Use: Dashboard stats - "5 pending approvals"
     * SQL: SELECT COUNT(*) FROM bookings WHERE booking_status = :status
     */
    long countByBookingStatus(BookingStatus status);

    /**
     * Count bookings for a car
     * Use: Car details page - "This car has 12 total bookings"
     * SQL: SELECT COUNT(*) FROM bookings WHERE car_id = :carId
     */
    long countByCarCarId(Long carId);

    /**
     * Count bookings by user
     * Use: User profile - "You have 5 rental bookings"
     * SQL: SELECT COUNT(*) FROM bookings WHERE user_id = :userId
     */
    long countByUserUserId(Long userId);
}
