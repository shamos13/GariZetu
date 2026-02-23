package com.amos.garizetu.Booking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpiryScheduler {

    private final BookingService bookingService;

    @Scheduled(fixedDelayString = "${booking.expiry-scan-ms:60000}")
    public void expirePendingBookings() {
        int expiredCount = bookingService.expirePendingPaymentBookings();
        if (expiredCount > 0) {
            log.info("Scheduler expired {} pending-payment booking(s)", expiredCount);
        }
    }
}
