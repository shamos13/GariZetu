package com.amos.garizetu.Booking.Enums;

public enum BookingStatus {
    PENDING_PAYMENT,
    CONFIRMED,
    ACTIVE,
    COMPLETED,
    CANCELLED,
    EXPIRED,

    // Legacy values kept for backward compatibility with existing records.
    PENDING,
    ADMIN_NOTIFIED,
    REJECTED
}
