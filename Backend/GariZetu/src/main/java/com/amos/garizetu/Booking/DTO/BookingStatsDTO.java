package com.amos.garizetu.Booking.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatsDTO {
    private long totalBookings;
    private long pendingCount;
    private long adminNotifiedCount;
    private long confirmedCount;
    private long activeCount;
    private long completedCount;
    private long cancelledCount;
    private long expiredCount;
    private long rejectedCount;
    private long overdueCount;
}
