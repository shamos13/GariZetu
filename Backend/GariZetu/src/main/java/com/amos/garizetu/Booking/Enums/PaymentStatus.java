package com.amos.garizetu.Booking.Enums;

public enum PaymentStatus {
    UNPAID,
    PAID,
    FAILED,
    REFUNDED,

    // Legacy value kept for backward compatibility with existing records.
    SIMULATED_PAID,
}
