package com.amos.garizetu.Booking.Entity;

import com.amos.garizetu.Booking.Enums.BookingStatus;
import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.User.Entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long bookingId;

    // Relationships
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    // Booking details
    @Column(name = "pickup_date", nullable = false)
    private LocalDate pickupDate;

    @Column(name = "return_date",nullable = false)
    private LocalDate returnDate;

    // Return Location can be different from pickup
    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "return_location")
    private String returnLocation;

    //Special request from customer
    @Column(name = "special_requests", length = 500)
    private String specialRequest;

    // Pricing
    @Column(name = "daily_price", nullable = false)
    private double dailyPrice;

    /**
     * Total Cost: (returnDate- pickupDate) days * dailyPrice
     * Calculated and stored when booking is created
     * */
    @Column(name = "total_cost", nullable = false)
    private double totalCost;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_status", nullable = false)
    private BookingStatus bookingStatus;

    // TimeStamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;

    // Updated whenever booking details change
    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

    // ============Utility Methods====================
    /**
     * Calculate number of days
     * This is frequently updated that's why we need a helper method
     * */
    public long getNumberOfDays() {

        if (pickupDate == null || returnDate == null){
            return 0;
        }
        return ChronoUnit.DAYS.between(pickupDate, returnDate);
    }

    // Recalculate total price if dates change
    public void recalculateTotalPrice() {
        long days = getNumberOfDays();
        totalCost = days * dailyPrice;
    }

    //Check if booking is active right now
    public boolean isCurrentlyActive() {
        LocalDate today = LocalDate.now();
        return !today.isBefore(pickupDate) && !today.isAfter(returnDate)
                && bookingStatus == BookingStatus.ACTIVE;
    }

    // Check if booking can be cancelled
    // Can't cancel if already COMPLETED
    public boolean canBeCancelled() {
        return bookingStatus != BookingStatus.COMPLETED
                && bookingStatus != BookingStatus.CANCELLED;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();

        // Default status when created
        if (bookingStatus == null){
            bookingStatus = BookingStatus.PENDING;
        }

        // Calculate price if not set
        if (totalCost == 0){
            recalculateTotalPrice();
        }
    }

    //@PreUpdate: Runs automatically BEFORE every update to DB
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    // ========== EQUALS & HASHCODE ========
    /**
     * Prevent concurrent modification errors in Collections
     * When using bookings in sets or comparing them
     *
     * We only use bookingID because:
     * - It's unique
     * - It never changes
     * - Two bookings with the same ID are the same booking
     * */

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Booking)) return false;
        Booking booking = (Booking) o;
        return bookingId != null && bookingId.equals(booking.bookingId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
