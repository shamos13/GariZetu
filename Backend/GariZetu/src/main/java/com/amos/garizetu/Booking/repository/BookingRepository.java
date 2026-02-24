package com.amos.garizetu.Booking.repository;

import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Booking.Enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ========= BASIC QUERIES ==========
    List<Booking> findByUserUserId(Long userId);

    List<Booking> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByCarCarId(Long carId);

    List<Booking> findByBookingStatus(BookingStatus bookingStatus);

    List<Booking> findByBookingStatusOrderByCreatedAtDesc(BookingStatus bookingStatus);

    @Query("SELECT b FROM Booking b WHERE COALESCE(b.adminNotificationRead, false) = false " +
            "AND b.adminNotifiedAt IS NOT NULL " +
            "ORDER BY b.adminNotifiedAt DESC")
    List<Booking> findUnreadAdminNotifications();

    @Query("SELECT b FROM Booking b WHERE b.adminNotifiedAt IS NOT NULL " +
            "ORDER BY b.adminNotifiedAt DESC")
    List<Booking> findAllAdminNotifications();

    List<Booking> findByUserUserIdAndBookingStatus(Long userId, BookingStatus status);

    /**
     * Find bookings for specific car and status
     * Use: "Check car availability" (check for ACTIVE/CONFIRMED bookings)
     * SQL: SELECT * FROM bookings
     *      WHERE car_id = :carId AND booking_status = :status
     */
    List<Booking> findByCarCarIdAndBookingStatus(Long carId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.car.carId IN :carIds " +
            "AND (" +
            "b.bookingStatus IN ('CONFIRMED', 'ACTIVE', 'ADMIN_NOTIFIED') " +
            "OR (" +
            "b.bookingStatus IN ('PENDING_PAYMENT', 'PENDING') " +
            "AND b.paymentStatus IN ('UNPAID', 'FAILED') " +
            "AND b.paymentExpiresAt IS NOT NULL " +
            "AND b.paymentExpiresAt > :asOf" +
            ")" +
            ")")
    List<Booking> findBlockingBookingsForCars(
            @Param("carIds") Collection<Long> carIds,
            @Param("asOf") LocalDateTime asOf
    );

    // ========== COMPLEX QUERY: AVAILABILITY CHECK ==========

    /**
     * Find bookings that block a new reservation:
     * - CONFIRMED / ACTIVE always block
     * - valid PENDING_PAYMENT bookings block only before payment expiry
     */
    @Query("SELECT b FROM Booking b WHERE b.car.carId = :carId " +
            "AND (" +
            "b.bookingStatus IN ('CONFIRMED', 'ACTIVE', 'ADMIN_NOTIFIED') " +
            "OR (" +
            "b.bookingStatus IN ('PENDING_PAYMENT', 'PENDING') " +
            "AND b.paymentStatus IN ('UNPAID', 'FAILED') " +
            "AND b.paymentExpiresAt IS NOT NULL " +
            "AND b.paymentExpiresAt > :asOf" +
            ")" +
            ") " +
            "AND b.pickupDate < :returnDate " +
            "AND b.returnDate > :pickupDate")
    List<Booking> findConflictingBookings(
            @Param("carId") Long carId,
            @Param("pickupDate") LocalDate pickupDate,
            @Param("returnDate") LocalDate returnDate,
            @Param("asOf") LocalDateTime asOf
    );

    @Query("SELECT b FROM Booking b WHERE " +
            "b.bookingStatus IN ('PENDING_PAYMENT', 'PENDING') " +
            "AND b.paymentStatus IN ('UNPAID', 'FAILED') " +
            "AND b.paymentExpiresAt IS NOT NULL " +
            "AND b.paymentExpiresAt <= :asOf")
    List<Booking> findExpiredPendingPaymentBookings(@Param("asOf") LocalDateTime asOf);

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

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingStatus = 'ACTIVE' " +
            "AND b.returnDate < :today")
    long countOverdueBookings(@Param("today") LocalDate today);

    // ========== STATISTICS QUERIES ==========

    /**
     * Count bookings by status
     * Use: Dashboard stats - "5 pending approvals"
     * SQL: SELECT COUNT(*) FROM bookings WHERE booking_status = :status
     */
    long countByBookingStatus(BookingStatus status);

    long countByBookingStatusIn(List<BookingStatus> statuses);

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

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query(value = "UPDATE bookings SET admin_notification_read = FALSE WHERE admin_notification_read IS NULL", nativeQuery = true)
    int backfillNullAdminNotificationRead();
}
