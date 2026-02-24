package com.amos.garizetu.Booking.service;

import com.amos.garizetu.Booking.DTO.BookingCreateRequest;
import com.amos.garizetu.Booking.DTO.BookingPaymentSimulationRequest;
import com.amos.garizetu.Booking.DTO.BookingResponseDTO;
import com.amos.garizetu.Booking.DTO.BookingStatsDTO;
import com.amos.garizetu.Booking.DTO.BookingUpdateDTO;
import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Booking.Enums.BookingStatus;
import com.amos.garizetu.Booking.Enums.PaymentStatus;
import com.amos.garizetu.Booking.exception.BookingConflictException;
import com.amos.garizetu.Booking.exception.BookingNotFoundException;
import com.amos.garizetu.Booking.exception.BookingValidationException;
import com.amos.garizetu.Booking.mapper.BookingMapper;
import com.amos.garizetu.Booking.repository.BookingRepository;
import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.Car.Enums.CarStatus;
import com.amos.garizetu.Repository.CarRepository;
import com.amos.garizetu.Repository.UserRepository;
import com.amos.garizetu.User.Entity.User;
import com.amos.garizetu.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private static final Set<BookingStatus> CUSTOMER_EDITABLE_STATUSES = Set.of(
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.PENDING, // Legacy
            BookingStatus.CONFIRMED
    );

    private static final Set<BookingStatus> TERMINAL_STATUSES = Set.of(
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
            BookingStatus.EXPIRED,
            BookingStatus.REJECTED // Legacy
    );

    private static final Set<BookingStatus> PENDING_PAYMENT_STATUSES = Set.of(
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.PENDING // Legacy
    );

    private static final Set<PaymentStatus> PAID_STATUSES = Set.of(
            PaymentStatus.PAID,
            PaymentStatus.SIMULATED_PAID // Legacy
    );

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private final SecurityUtils securityUtils;

    @Value("${booking.payment-window-minutes:15}")
    private long paymentWindowMinutes;

    // ========== CREATE BOOKING ==========

    public BookingResponseDTO createBooking(BookingCreateRequest request) {
        expirePendingPaymentBookings();

        Long authenticatedUserId = securityUtils.getAuthenticatedUserId();
        log.info("User {} creating booking for car {}", authenticatedUserId, request.getCarId());

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new BookingNotFoundException("Car not found with ID: " + request.getCarId()));

        // ACTIVE car in this domain means the car is operational/listed (not in maintenance).
        if (car.getCarStatus() == CarStatus.MAINTENANCE) {
            throw new BookingConflictException("Car is currently under maintenance");
        }

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new BookingNotFoundException("User not found with ID: " + authenticatedUserId));

        validateBookingDates(request.getPickupDate(), request.getReturnDate());

        LocalDateTime now = LocalDateTime.now();
        checkCarAvailability(request.getCarId(), request.getPickupDate(), request.getReturnDate(), now);

        Booking booking = bookingMapper.toEntity(request, user, car);

        long days = ChronoUnit.DAYS.between(request.getPickupDate(), request.getReturnDate());
        booking.setDailyPrice(car.getDailyPrice());
        booking.setTotalPrice(days * car.getDailyPrice());
        booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setPaymentExpiresAt(now.plusMinutes(Math.max(1, paymentWindowMinutes)));
        booking.setAdminNotificationRead(true);
        booking.setAdminNotifiedAt(null);
        booking.setAdminNotificationReadAt(null);

        Booking savedBooking = bookingRepository.save(booking);
        log.info(
                "Booking created with ID: {} - Status: {} - Payment expires at: {}",
                savedBooking.getBookingId(),
                savedBooking.getBookingStatus(),
                savedBooking.getPaymentExpiresAt()
        );

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== RETRIEVE BOOKINGS ==========

    public List<BookingResponseDTO> getAllBookings() {
        log.info("Fetching all bookings");
        return mapToDTOList(bookingRepository.findAllByOrderByCreatedAtDesc());
    }

    public List<BookingResponseDTO> getAllBookings(BookingStatus status) {
        return status != null ? getBookingsByStatus(status) : getAllBookings();
    }

    public List<BookingResponseDTO> getCustomerBookings() {
        Long userId = securityUtils.getAuthenticatedUserId();
        log.debug("Fetching bookings for user {}", userId);
        return mapToDTOList(bookingRepository.findByUserUserIdOrderByCreatedAtDesc(userId));
    }

    public List<BookingResponseDTO> getCarBookings(Long carId) {
        log.debug("Fetching bookings for car {}", carId);
        return mapToDTOList(bookingRepository.findByCarCarId(carId));
    }

    public BookingResponseDTO getBookingById(Long bookingId) {
        log.debug("Fetching booking {}", bookingId);
        Booking booking = findBookingOrThrow(bookingId);
        validateBookingIntegrity(booking, "view booking");
        assertAdminOrBookingOwner(booking, "view");
        return bookingMapper.toResponseDTO(booking);
    }

    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        log.debug("Fetching bookings with status: {}", status);
        return mapToDTOList(bookingRepository.findByBookingStatusOrderByCreatedAtDesc(status));
    }

    public List<BookingResponseDTO> getAdminNotifications(boolean includeRead) {
        List<Booking> notifications = includeRead
                ? bookingRepository.findAllAdminNotifications()
                : bookingRepository.findUnreadAdminNotifications();
        return mapToDTOList(notifications);
    }

    public BookingResponseDTO markAdminNotificationAsRead(Long bookingId) {
        Booking booking = findBookingOrThrow(bookingId);
        validateBookingIntegrity(booking, "mark notification");

        if (booking.getAdminNotifiedAt() == null) {
            throw new BookingConflictException("Booking has no admin notification to mark as read");
        }

        if (!booking.isAdminNotificationRead()) {
            booking.setAdminNotificationRead(true);
            if (booking.getAdminNotificationReadAt() == null) {
                booking.setAdminNotificationReadAt(LocalDateTime.now());
            }
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Marked admin notification as read for booking {}", bookingId);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== BOOKING MANAGEMENT ==========

    public BookingResponseDTO simulatePayment(Long bookingId, BookingPaymentSimulationRequest request) {
        expirePendingPaymentBookings();

        Booking booking = findBookingOrThrow(bookingId);
        validateBookingIntegrity(booking, "process payment");
        assertAdminOrBookingOwner(booking, "simulate payment for");

        if (TERMINAL_STATUSES.contains(booking.getBookingStatus())) {
            throw new BookingConflictException("Cannot process payment for booking with status: " + booking.getBookingStatus());
        }

        if (!PENDING_PAYMENT_STATUSES.contains(booking.getBookingStatus())) {
            throw new BookingConflictException("Only pending-payment bookings can process payment retries");
        }

        LocalDateTime now = LocalDateTime.now();
        if (hasPaymentWindowExpired(booking, now)) {
            expireBooking(booking, now, "Payment window expired before payment completion");
            bookingRepository.save(booking);
            throw new BookingConflictException("Payment window has expired for this booking");
        }

        if (PAID_STATUSES.contains(booking.getPaymentStatus())) {
            throw new BookingConflictException("Payment has already been completed for this booking");
        }

        boolean paymentSuccessful = request == null
                || request.getPaymentSuccessful() == null
                || request.getPaymentSuccessful();

        booking.setPaymentMethod(normalizePaymentMethod(request));
        booking.setPaymentReference(generatePaymentReference(bookingId, paymentSuccessful ? "PAY" : "FAIL"));
        booking.setPaymentSimulatedAt(now);

        if (!paymentSuccessful) {
            booking.setPaymentStatus(PaymentStatus.FAILED);
            booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);

            Booking savedBooking = bookingRepository.save(booking);
            log.warn(
                    "Payment failed for booking {}. Retry allowed until {}",
                    bookingId,
                    savedBooking.getPaymentExpiresAt()
            );
            return bookingMapper.toResponseDTO(savedBooking);
        }

        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        booking.setAdminNotifiedAt(now);
        booking.setAdminNotificationRead(false);
        booking.setAdminNotificationReadAt(null);

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Payment completed for booking {}. Booking confirmed.", bookingId);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    public BookingResponseDTO updateBooking(Long bookingId, BookingUpdateDTO updateDTO) {
        expirePendingPaymentBookings();
        log.info("Updating booking {}", bookingId);

        Booking booking = findBookingOrThrow(bookingId);
        validateBookingIntegrity(booking, "update booking");
        assertAdminOrBookingOwner(booking, "update");

        boolean isAdmin = securityUtils.hasRole("ADMIN");

        if (!isAdmin && updateDTO.getBookingStatus() != null) {
            throw new AccessDeniedException("Only admins can change booking status");
        }

        if (!isAdmin && hasCustomerEditableFields(updateDTO)
                && !CUSTOMER_EDITABLE_STATUSES.contains(booking.getBookingStatus())) {
            throw new BookingConflictException("Booking details can no longer be modified in status: " + booking.getBookingStatus());
        }

        if (updateDTO.getReturnLocation() != null) {
            booking.setReturnLocation(updateDTO.getReturnLocation());
        }

        if (updateDTO.getSpecialRequests() != null) {
            booking.setSpecialRequests(updateDTO.getSpecialRequests());
        }

        if (isAdmin && updateDTO.getBookingStatus() != null) {
            applyAdminStatusTransition(booking, updateDTO.getBookingStatus(), updateDTO.getRefundAmount());
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} updated successfully", bookingId);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    public BookingResponseDTO cancelBooking(Long bookingId, String reason) {
        expirePendingPaymentBookings();
        log.info("Cancelling booking {}", bookingId);

        Booking booking = findBookingOrThrow(bookingId);
        validateBookingIntegrity(booking, "cancel booking");
        assertAdminOrBookingOwner(booking, "cancel");

        if (!booking.canBeCancelled()) {
            throw new BookingConflictException("Cannot cancel booking with status: " + booking.getBookingStatus());
        }

        boolean isAdmin = securityUtils.hasRole("ADMIN");
        if (!isAdmin) {
            if (!booking.getPickupDate().isAfter(LocalDate.now())) {
                throw new BookingConflictException("Customers may only cancel before the rental start date");
            }

            if (booking.getBookingStatus() == BookingStatus.ACTIVE) {
                throw new AccessDeniedException("Active bookings can only be cancelled by an admin");
            }
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        if (booking.getCar() != null) {
            booking.getCar().setCarStatus(CarStatus.AVAILABLE);
        }

        if (PAID_STATUSES.contains(booking.getPaymentStatus())) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        if (!booking.isAdminNotificationRead()) {
            booking.setAdminNotificationRead(true);
            booking.setAdminNotificationReadAt(LocalDateTime.now());
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.warn("Booking {} cancelled. Reason: {}", bookingId, reason);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== VALIDATION METHODS ==========

    private void validateBookingDates(LocalDate pickupDate, LocalDate returnDate) {
        LocalDate today = LocalDate.now();

        if (pickupDate.isBefore(today)) {
            throw new BookingValidationException("Pickup date cannot be in the past");
        }

        if (!returnDate.isAfter(pickupDate)) {
            throw new BookingValidationException("Return date must be after pickup date");
        }

        long days = ChronoUnit.DAYS.between(pickupDate, returnDate);
        if (days < 1) {
            throw new BookingValidationException("Minimum rental period is 1 day");
        }
    }

    private void checkCarAvailability(Long carId, LocalDate pickupDate, LocalDate returnDate, LocalDateTime asOf) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(carId, pickupDate, returnDate, asOf);

        if (!conflicts.isEmpty()) {
            String conflictSummary = conflicts.stream()
                    .map(b -> b.getBookingId() + ":" + b.getBookingStatus())
                    .collect(Collectors.joining(", "));
            log.warn("Car {} not available for {} to {}. Conflicts: {}", carId, pickupDate, returnDate, conflictSummary);
            throw new BookingConflictException("Car is not available for the selected dates");
        }

        log.debug("Car {} is available for {} to {}", carId, pickupDate, returnDate);
    }

    private void assertAdminOrBookingOwner(Booking booking, String action) {
        if (securityUtils.hasRole("ADMIN")) {
            return;
        }
        if (booking.getUser() == null || booking.getUser().getUserId() == null) {
            throw new BookingConflictException("Booking ownership data is missing. Please contact support.");
        }
        Long authenticatedUserId = securityUtils.getAuthenticatedUserId();
        Long bookingOwnerId = booking.getUser().getUserId();
        if (!bookingOwnerId.equals(authenticatedUserId)) {
            throw new AccessDeniedException("You are not allowed to " + action + " this booking");
        }
    }

    private void applyAdminStatusTransition(Booking booking, BookingStatus newStatus, Double refundAmount) {
        BookingStatus currentStatus = booking.getBookingStatus();

        if (currentStatus == newStatus) {
            return;
        }

        validateAdminTransition(currentStatus, newStatus);

        if (newStatus == BookingStatus.CONFIRMED && !PAID_STATUSES.contains(booking.getPaymentStatus())) {
            throw new BookingConflictException("A booking cannot be confirmed before successful payment");
        }

        if (newStatus == BookingStatus.EXPIRED && PAID_STATUSES.contains(booking.getPaymentStatus())) {
            throw new BookingConflictException("A paid booking cannot be marked as expired");
        }

        booking.setBookingStatus(newStatus);

        if (newStatus == BookingStatus.ACTIVE && booking.getCar() != null) {
            booking.getCar().setCarStatus(CarStatus.RENTED);
        }

        if (newStatus == BookingStatus.COMPLETED
                || newStatus == BookingStatus.CANCELLED
                || newStatus == BookingStatus.EXPIRED
                || newStatus == BookingStatus.REJECTED) {
            if (booking.getCar() != null) {
            booking.getCar().setCarStatus(CarStatus.AVAILABLE);
            }
        }

        if (newStatus == BookingStatus.CANCELLED || newStatus == BookingStatus.REJECTED) {
            if (PAID_STATUSES.contains(booking.getPaymentStatus())) {
                booking.setPaymentStatus(PaymentStatus.REFUNDED);
            }

            if (refundAmount != null && refundAmount < 0) {
                throw new BookingValidationException("Refund amount cannot be negative");
            }
        }

        if (newStatus == BookingStatus.CONFIRMED) {
            booking.setAdminNotifiedAt(LocalDateTime.now());
            booking.setAdminNotificationRead(false);
            booking.setAdminNotificationReadAt(null);
        } else if (booking.getAdminNotifiedAt() != null && !booking.isAdminNotificationRead()) {
            booking.setAdminNotificationRead(true);
            if (booking.getAdminNotificationReadAt() == null) {
                booking.setAdminNotificationReadAt(LocalDateTime.now());
            }
        }

        log.info("Booking {} status changed: {} -> {}",
                booking.getBookingId(), currentStatus, newStatus);
    }

    private void validateAdminTransition(BookingStatus currentStatus, BookingStatus newStatus) {
        Set<BookingStatus> allowedStatuses;

        switch (currentStatus) {
            case PENDING_PAYMENT, PENDING -> allowedStatuses = Set.of(
                    BookingStatus.CONFIRMED,
                    BookingStatus.CANCELLED,
                    BookingStatus.EXPIRED
            );
            case ADMIN_NOTIFIED -> allowedStatuses = Set.of(
                    BookingStatus.CONFIRMED,
                    BookingStatus.CANCELLED
            );
            case CONFIRMED -> allowedStatuses = Set.of(
                    BookingStatus.ACTIVE,
                    BookingStatus.COMPLETED,
                    BookingStatus.CANCELLED
            );
            case ACTIVE -> allowedStatuses = Set.of(
                    BookingStatus.COMPLETED,
                    BookingStatus.CANCELLED
            );
            default -> allowedStatuses = Set.of();
        }

        if (!allowedStatuses.contains(newStatus)) {
            throw new BookingConflictException("Invalid status transition: " + currentStatus + " -> " + newStatus);
        }
    }

    private boolean hasCustomerEditableFields(BookingUpdateDTO updateDTO) {
        return updateDTO.getReturnLocation() != null || updateDTO.getSpecialRequests() != null;
    }

    private String normalizePaymentMethod(BookingPaymentSimulationRequest request) {
        String method = request != null ? request.getPaymentMethod() : null;
        if (method == null || method.isBlank()) {
            return "M_PESA";
        }

        return method.trim()
                .replace('-', '_')
                .replace(' ', '_')
                .toUpperCase(Locale.ROOT);
    }

    private String generatePaymentReference(Long bookingId, String prefix) {
        String normalizedPrefix = (prefix == null || prefix.isBlank()) ? "PAY" : prefix.toUpperCase(Locale.ROOT);
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return normalizedPrefix + "-" + bookingId + "-" + suffix;
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
    }

    private List<BookingResponseDTO> mapToDTOList(List<Booking> bookings) {
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    private boolean hasPaymentWindowExpired(Booking booking, LocalDateTime now) {
        if (!PENDING_PAYMENT_STATUSES.contains(booking.getBookingStatus())) {
            return false;
        }
        if (booking.getPaymentExpiresAt() == null) {
            return false;
        }
        return !booking.getPaymentExpiresAt().isAfter(now);
    }

    private void expireBooking(Booking booking, LocalDateTime now, String reason) {
        booking.setBookingStatus(BookingStatus.EXPIRED);
        if (booking.getCar() != null) {
            booking.getCar().setCarStatus(CarStatus.AVAILABLE);
        }
        if (!booking.isAdminNotificationRead()) {
            booking.setAdminNotificationRead(true);
            booking.setAdminNotificationReadAt(now);
        }
        log.warn("Booking {} marked EXPIRED. Reason: {}", booking.getBookingId(), reason);
    }

    private void validateBookingIntegrity(Booking booking, String action) {
        if (booking == null) {
            throw new BookingConflictException("Booking could not be loaded for " + action + ".");
        }
        if (booking.getUser() == null || booking.getUser().getUserId() == null) {
            throw new BookingConflictException("Booking record is missing customer details. Please contact support.");
        }
        if (booking.getCar() == null || booking.getCar().getCarId() == null) {
            throw new BookingConflictException("Booking record is missing vehicle details. Please contact support.");
        }
        if (booking.getBookingStatus() == null) {
            throw new BookingConflictException("Booking status is invalid. Please contact support.");
        }
    }

    public int expirePendingPaymentBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingPaymentBookings(now);

        if (expiredBookings.isEmpty()) {
            return 0;
        }

        expiredBookings.forEach(booking -> expireBooking(booking, now, "Payment window elapsed"));
        bookingRepository.saveAll(expiredBookings);
        log.info("Expired {} pending-payment booking(s)", expiredBookings.size());
        return expiredBookings.size();
    }

    // ========== STATISTICS ==========

    public BookingStatsDTO getBookingStats() {
        log.info("Calculating booking statistics");

        long pendingCount = bookingRepository.countByBookingStatus(BookingStatus.PENDING_PAYMENT)
                + bookingRepository.countByBookingStatus(BookingStatus.PENDING); // Legacy
        long adminNotifiedCount = bookingRepository.countByBookingStatus(BookingStatus.ADMIN_NOTIFIED); // Legacy
        long confirmedCount = bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        long activeCount = bookingRepository.countByBookingStatus(BookingStatus.ACTIVE);
        long completedCount = bookingRepository.countByBookingStatus(BookingStatus.COMPLETED);
        long cancelledCount = bookingRepository.countByBookingStatus(BookingStatus.CANCELLED);
        long expiredCount = bookingRepository.countByBookingStatus(BookingStatus.EXPIRED);
        long rejectedCount = bookingRepository.countByBookingStatus(BookingStatus.REJECTED); // Legacy
        long totalCount = bookingRepository.count();

        long overdueCount = bookingRepository.countOverdueBookings(LocalDate.now());

        return new BookingStatsDTO(
                totalCount,
                pendingCount,
                adminNotifiedCount,
                confirmedCount,
                activeCount,
                completedCount,
                cancelledCount,
                expiredCount,
                rejectedCount,
                overdueCount
        );
    }
}
