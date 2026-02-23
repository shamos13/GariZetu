package com.amos.garizetu.Booking.DTO;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingPaymentSimulationRequest {

    @Size(max = 30, message = "Payment method must not exceed 30 characters")
    private String paymentMethod;

    // Optional simulation flag. Null defaults to true (successful payment).
    private Boolean paymentSuccessful;
}
