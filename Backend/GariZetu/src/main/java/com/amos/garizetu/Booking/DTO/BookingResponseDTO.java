package com.amos.garizetu.Booking.DTO;

import com.amos.garizetu.Booking.Enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDTO {

    // ============= IDENTIFIERS ==============
    private Long bookingId;
    private Long carId;
    private Long userId;

    // ============ CAR DETAILS (From related Car entity) ===================
    private String carMake;
    private String carModel;
    private String registrationNumber;
    private String colour;
    private int carYear;

    // ========== USER DETAILS (From related user Entity) ===========
    private String userName;
    private String userEmail;
    private String phoneNumber;

    // ========= BOOKING DATES ====================
    private LocalDate pickupDate;
    private LocalDate returnDate;
    private long numberOfDays;

    // ======== PRICING ==============
    private double dailyPrice;
    private double totalPrice;

    // ========= LOCATIONS ================
    private String pickupLocation;
    private String returnLocation;
    private String specialRequests;

    // ========= STATUS ===================
    private BookingStatus bookingStatus;

    // ========= TIMESTAMPS ==================
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
