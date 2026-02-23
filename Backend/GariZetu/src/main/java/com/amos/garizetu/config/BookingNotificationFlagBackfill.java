package com.amos.garizetu.config;

import com.amos.garizetu.Booking.Enums.BookingStatus;
import com.amos.garizetu.Booking.Enums.PaymentStatus;
import com.amos.garizetu.Booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingNotificationFlagBackfill implements CommandLineRunner {

    private static final String BOOKING_STATUS_CONSTRAINT = "bookings_booking_status_check";
    private static final String PAYMENT_STATUS_CONSTRAINT = "bookings_payment_status_check";

    private final BookingRepository bookingRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        int normalizedRows = bookingRepository.backfillNullAdminNotificationRead();
        if (normalizedRows > 0) {
            log.warn("Normalized {} booking rows with NULL admin_notification_read", normalizedRows);
        } else {
            log.debug("No booking rows required admin_notification_read normalization");
        }

        enforceColumnDefaults();
        enforceBookingStatusConstraint();
        enforcePaymentStatusConstraint();
    }

    private void enforceColumnDefaults() {
        try {
            jdbcTemplate.execute("ALTER TABLE bookings ALTER COLUMN admin_notification_read SET DEFAULT FALSE");
            jdbcTemplate.execute("ALTER TABLE bookings ALTER COLUMN admin_notification_read SET NOT NULL");
            log.debug("Enforced default false and NOT NULL on bookings.admin_notification_read");
        } catch (DataAccessException ex) {
            log.warn("Could not enforce bookings.admin_notification_read constraints; continuing with entity-level safeguards");
        }
    }

    private void enforceBookingStatusConstraint() {
        try {
            String allowedStatuses = Arrays.stream(BookingStatus.values())
                    .map(BookingStatus::name)
                    .map(status -> "'" + status + "'")
                    .collect(Collectors.joining(", "));

            jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS " + BOOKING_STATUS_CONSTRAINT);
            jdbcTemplate.execute(
                    "ALTER TABLE bookings ADD CONSTRAINT " + BOOKING_STATUS_CONSTRAINT
                            + " CHECK (booking_status IN (" + allowedStatuses + "))"
            );

            log.debug("Enforced {} with statuses: {}", BOOKING_STATUS_CONSTRAINT, allowedStatuses);
        } catch (DataAccessException ex) {
            log.warn("Could not enforce bookings.booking_status check constraint; stale constraints may reject updates");
        }
    }

    private void enforcePaymentStatusConstraint() {
        try {
            String allowedStatuses = Arrays.stream(PaymentStatus.values())
                    .map(PaymentStatus::name)
                    .map(status -> "'" + status + "'")
                    .collect(Collectors.joining(", "));

            jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS " + PAYMENT_STATUS_CONSTRAINT);
            jdbcTemplate.execute(
                    "ALTER TABLE bookings ADD CONSTRAINT " + PAYMENT_STATUS_CONSTRAINT
                            + " CHECK (payment_status IN (" + allowedStatuses + "))"
            );

            log.debug("Enforced {} with statuses: {}", PAYMENT_STATUS_CONSTRAINT, allowedStatuses);
        } catch (DataAccessException ex) {
            log.warn("Could not enforce bookings.payment_status check constraint; stale constraints may reject updates");
        }
    }
}
