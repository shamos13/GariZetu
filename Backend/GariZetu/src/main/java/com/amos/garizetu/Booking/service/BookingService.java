package com.amos.garizetu.Booking.service;

import com.amos.garizetu.Booking.DTO.BookingCreateRequest;
import com.amos.garizetu.Booking.DTO.BookingResponseDTO;
import com.amos.garizetu.Booking.DTO.BookingStatsDTO;
import com.amos.garizetu.Booking.DTO.BookingUpdateDTO;
import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Booking.Enums.BookingStatus;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private final SecurityUtils securityUtils;

    // ========== CREATE BOOKING ==========

    /**
     * Create a new booking
     *
     * Steps:
     * 1. Validate car exists
     * 2. Validate user exists
     * 3. Validate dates (pickup < return)
     * 4. Check car availability for those dates
     * 5. Calculate total price
     * 6. Create booking with PENDING status
     * 7. Save to database
     */
    public BookingResponseDTO createBooking(BookingCreateRequest request) {
        // Security hardening: always trust user identity from SecurityContext, never request payload.
        Long authenticatedUserId = securityUtils.getAuthenticatedUserId();
        log.info("User {} creating booking for car {}", authenticatedUserId, request.getCarId());

        // Step 1: Validate car exists
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found with ID: " + request.getCarId()));
        log.debug("Car found: {}", car.getMake());

        // Step 2: Validate user exists
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + authenticatedUserId));
        log.debug("User found: {}", user.getEmail());

        // Step 3: Validate dates
        validateBookingDates(request.getPickupDate(), request.getReturnDate());

        // Step 4: Check availability
        checkCarAvailability(request.getCarId(), request.getPickupDate(), request.getReturnDate());

        // Step 5: Create and save booking
        Booking booking = bookingMapper.toEntity(request, user, car);


        // Step 6: Calculate price
        long days = ChronoUnit.DAYS.between(request.getPickupDate(), request.getReturnDate());
        booking.setDailyPrice(car.getDailyPrice());
        booking.setTotalPrice(days * car.getDailyPrice());

        // Step 7: Status is auto-set to PENDING in @PrePersist
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created with ID: {} - Status: PENDING", savedBooking.getBookingId());

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== RETRIEVE BOOKINGS ==========

    /**
     * Get all bookings (admin only)
     */
    public List<BookingResponseDTO> getAllBookings() {
        log.info("Fetching all bookings");
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Controller simplification:
     * Keep filtering decision in service so controller remains transport-only.
     */
    public List<BookingResponseDTO> getAllBookings(BookingStatus status) {
        return status != null ? getBookingsByStatus(status) : getAllBookings();
    }

    /**
     * Get bookings by customer ID
     * Use: Customer views their rental history
     */
    public List<BookingResponseDTO> getCustomerBookings() {
        // Fetch only bookings that belong to authenticated user.
        Long userId = securityUtils.getAuthenticatedUserId();
        log.debug("Fetching bookings for user {}", userId);
        List<Booking> bookings = bookingRepository.findByUserUserId(userId);
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get bookings for a car
     * Use: Check car rental history, availability
     */
    public List<BookingResponseDTO> getCarBookings(Long carId) {
        log.debug("Fetching bookings for car {}", carId);
        List<Booking> bookings = bookingRepository.findByCarCarId(carId);
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get single booking by ID
     */
    public BookingResponseDTO getBookingById(Long bookingId) {
        log.debug("Fetching booking {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        // Authorization in service: only booking owner or admin can access booking details.
        assertAdminOrBookingOwner(booking, "view");
        return bookingMapper.toResponseDTO(booking);
    }

    /**
     * Get bookings by status
     * Use: Admin dashboard - "Show all PENDING bookings"
     */
    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        log.debug("Fetching bookings with status: {}", status);
        List<Booking> bookings = bookingRepository.findByBookingStatus(status);
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ========== UPDATE BOOKING ==========

    /**
     * Admin updates booking (approve, reject, etc)
     */
    public BookingResponseDTO updateBooking(Long bookingId, BookingUpdateDTO updateDTO) {
        log.info("Updating booking {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        // Authorization in service: prevent users from updating other users' bookings.
        assertAdminOrBookingOwner(booking, "update");

        // Update status if provided
        if (updateDTO.getBookingStatus() != null) {
            BookingStatus oldStatus = booking.getBookingStatus();
            booking.setBookingStatus(updateDTO.getBookingStatus());
            log.info("Booking {} status changed: {} → {}",
                    bookingId, oldStatus, updateDTO.getBookingStatus());

            // If confirming: car becomes RENTED
            if (updateDTO.getBookingStatus() == BookingStatus.CONFIRMED) {
                booking.getCar().setCarStatus(CarStatus.RENTED);
            }
            // If completing: car becomes AVAILABLE again
            else if (updateDTO.getBookingStatus() == BookingStatus.COMPLETED) {
                booking.getCar().setCarStatus(CarStatus.AVAILABLE);
            }
        }

        // Update locations if provided
        if (updateDTO.getReturnLocation() != null) {
            booking.setReturnLocation(updateDTO.getReturnLocation());
        }

        // Update special requests if provided
        if (updateDTO.getSpecialRequests() != null) {
            booking.setSpecialRequests(updateDTO.getSpecialRequests());
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking {} updated successfully", bookingId);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== CANCEL BOOKING ==========

    /**
     * Cancel a booking
     * Can only cancel if not already completed
     */
    public BookingResponseDTO cancelBooking(Long bookingId, String reason) {
        log.info("Cancelling booking {}", bookingId);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        // Authorization in service: prevent users from cancelling other users' bookings.
        assertAdminOrBookingOwner(booking, "cancel");

        if (!booking.canBeCancelled()) {
            throw new RuntimeException("Cannot cancel booking with status: " + booking.getBookingStatus());
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        // Car becomes available again
        booking.getCar().setCarStatus(CarStatus.AVAILABLE);

        Booking savedBooking = bookingRepository.save(booking);
        log.warn("Booking {} cancelled. Reason: {}", bookingId, reason);

        return bookingMapper.toResponseDTO(savedBooking);
    }

    // ========== VALIDATION METHODS ==========

    /**
     * Validate booking dates
     * - Pickup must be before return
     * - Pickup must be today or future
     */
    private void validateBookingDates(LocalDate pickupDate, LocalDate returnDate) {
        LocalDate today = LocalDate.now();

        if (pickupDate.isBefore(today)) {
            throw new RuntimeException("Pickup date cannot be in the past");
        }

        if (!returnDate.isAfter(pickupDate)) {
            throw new RuntimeException("Return date must be after pickup date");
        }

        // Minimum rental period (optional)
        long days = ChronoUnit.DAYS.between(pickupDate, returnDate);
        if (days < 1) {
            throw new RuntimeException("Minimum rental period is 1 day");
        }
    }

    /**
     * Check if car is available for requested dates
     * Throws exception if conflicts found
     */
    private void checkCarAvailability(Long carId, LocalDate pickupDate, LocalDate returnDate) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                carId, pickupDate, returnDate);

        if (!conflicts.isEmpty()) {
            log.warn("Car {} not available for {} to {}", carId, pickupDate, returnDate);
            throw new RuntimeException("Car is not available for the selected dates");
        }

        log.debug("Car {} is available for {} to {}", carId, pickupDate, returnDate);
    }

    /**
     * Centralized ownership rule:
     * - ADMIN can manage any booking
     * - non-admin users can only manage their own bookings
     */
    private void assertAdminOrBookingOwner(Booking booking, String action) {
        if (securityUtils.hasRole("ADMIN")) {
            return;
        }
        Long authenticatedUserId = securityUtils.getAuthenticatedUserId();
        Long bookingOwnerId = booking.getUser().getUserId();
        if (!bookingOwnerId.equals(authenticatedUserId)) {
            throw new RuntimeException("You are not allowed to " + action + " this booking");
        }
    }

    // ========== STATISTICS ==========

    /**
     * Get booking statistics for dashboard
     */
    public BookingStatsDTO getBookingStats() {
        log.info("Calculating booking statistics");

        long pendingCount = bookingRepository.countByBookingStatus(BookingStatus.PENDING);
        long confirmedCount = bookingRepository.countByBookingStatus(BookingStatus.CONFIRMED);
        long activeCount = bookingRepository.countByBookingStatus(BookingStatus.ACTIVE);
        long completedCount = bookingRepository.countByBookingStatus(BookingStatus.COMPLETED);
        long cancelledCount = bookingRepository.countByBookingStatus(BookingStatus.CANCELLED);
        long totalCount = pendingCount + confirmedCount + activeCount + completedCount + cancelledCount;

        // Find overdue rentals
        long overdueCount = bookingRepository.findOverdueBookings(LocalDate.now()).size();

        return new BookingStatsDTO(totalCount, pendingCount, confirmedCount,
                activeCount, completedCount, cancelledCount, overdueCount);
    }
}
