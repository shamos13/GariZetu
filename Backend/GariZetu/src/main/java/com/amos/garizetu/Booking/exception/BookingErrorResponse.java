package com.amos.garizetu.Booking.exception;

import java.time.LocalDateTime;

public record BookingErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp
) {
}
