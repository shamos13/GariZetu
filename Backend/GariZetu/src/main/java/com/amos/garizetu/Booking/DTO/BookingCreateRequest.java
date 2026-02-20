package com.amos.garizetu.Booking.DTO;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    //BookingCreateRequest - Data Customer sends when creating a booking

    // ========= REQUIRED FIELDS ==========
    private Long carId;
    // userId is intentionally not accepted from client payload.
    // BookingService always resolves user identity from authenticated JWT context.

    /**
     * @FutureOrPresent: Date must be today or later
     * Prevents: booking in the past
     * */
    @NotNull(message = "Pickup date is required")
    @FutureOrPresent(message = "Pickup date must be today or in the future")
    private LocalDate pickupDate;

    /**
     * @Future: Date must be after today
     * Why not FutureOrPresent? Because return must be AFTER pickup
     * if return = today, customer would have 0 days */

    @NotNull(message = "Return date is required")
    @Future(message = "Return date must be in the future")
    private LocalDate returnDate;

    @NotBlank(message = "Pickup location is required")
    @Size(min = 2, max = 100, message = "Pickup location must be between 2 and 100 characters")
    private String pickupLocation;

    // ========== OPTIONAL FIELDS =============
    /**
     * Can be null - customer might not specify
     * if null, system will use pickupLocation as default
     * */
    @Size(max = 100, message = "Return location must not exceed 100 characters")
    private String returnLocation;

    @Size(max = 500, message = "Special requests must not exceed 500 characters")
    private String specialRequests;
}
