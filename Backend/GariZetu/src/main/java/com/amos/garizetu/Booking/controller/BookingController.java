package com.amos.garizetu.Booking.controller;

import com.amos.garizetu.Booking.DTO.BookingCreateRequest;
import com.amos.garizetu.Booking.DTO.BookingResponseDTO;
import com.amos.garizetu.Booking.DTO.BookingStatsDTO;
import com.amos.garizetu.Booking.DTO.BookingUpdateDTO;
import com.amos.garizetu.Booking.Enums.BookingStatus;
import com.amos.garizetu.Booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * BookingController - REST API endpoints for booking operations
 *
 * Endpoints:
 * - POST   /bookings/create                 - Create booking
 * - GET    /bookings/my-bookings            - Get customer's bookings
 * - GET    /bookings/:id                    - Get booking details
 * - PATCH  /bookings/:id                    - Update booking
 * - DELETE /bookings/:id                    - Cancel booking
 * - GET    /admin/bookings                  - Get all bookings (admin)
 * - GET    /admin/bookings/stats            - Get statistics (admin)
 */

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {


    private final BookingService bookingService;

    // ========== CUSTOMER ENDPOINTS ==========

    /**
     * Create a new booking
     * POST /api/v1/bookings/create
     *
     * Requires: Authentication (JWT token)
     * Body: {carId, pickupDate, returnDate, pickupLocation, ...}
     * Response: 201 Created with booking details
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        log.info("User {} creating booking for car {}",
                authentication.getName(), request.getCarId());

        // Extract user ID from JWT token
        Long userId = getUserIdFromAuthentication(authentication);

        BookingResponseDTO booking = bookingService.createBooking(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    /**
     * Get customer's bookings
     * GET /api/v1/bookings/my-bookings
     *
     * Returns: List of all bookings for authenticated customer
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        log.debug("User {} fetching their bookings", userId);

        List<BookingResponseDTO> bookings = bookingService.getCustomerBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking details
     * GET /api/v1/bookings/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBooking(@PathVariable Long id) {
        log.debug("Fetching booking {}", id);
        BookingResponseDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    /**
     * Update booking (customer or admin)
     * PATCH /api/v1/bookings/:id
     *
     * Body: {bookingStatus?, returnLocation?, specialRequests?}
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingUpdateDTO updateDTO) {
        log.info("Updating booking {}", id);
        BookingResponseDTO booking = bookingService.updateBooking(id, updateDTO);
        return ResponseEntity.ok(booking);
    }

    /**
     * Cancel booking
     * DELETE /api/v1/bookings/:id
     *
     * QueryParam: reason (optional reason for cancellation)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        log.info("Cancelling booking {}", id);
        BookingResponseDTO booking = bookingService.cancelBooking(id, reason != null ? reason : "No reason provided");
        return ResponseEntity.ok(booking);
    }

    // ========== ADMIN ENDPOINTS ==========

    /**
     * Get all bookings
     * GET /api/v1/admin/bookings
     *
     * Query param: status (optional filter)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        log.info("Admin fetching all bookings");

        List<BookingResponseDTO> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatus(status);
        } else {
            bookings = bookingService.getAllBookings();
        }

        return ResponseEntity.ok(bookings);
    }

    /**
     * Get bookings for a car
     * GET /api/v1/admin/bookings/car/:carId
     */
    @GetMapping("/admin/car/{carId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getCarBookings(@PathVariable Long carId) {
        log.info("Admin fetching bookings for car {}", carId);
        List<BookingResponseDTO> bookings = bookingService.getCarBookings(carId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking statistics
     * GET /api/v1/admin/bookings/stats
     *
     * Returns: {totalBookings, pendingCount, confirmedCount, ...}
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingStatsDTO> getBookingStats() {
        log.info("Admin fetching booking statistics");
        BookingStatsDTO stats = bookingService.getBookingStats();
        return ResponseEntity.ok(stats);
    }

    // ========== HELPER METHODS ==========

    /**
     * Extract user ID from JWT authentication
     * In real app, you'd get this from the token's claims
     * For now, using email as temporary identifier
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        // TODO: Extract actual user ID from JWT token claims
        // For now, return 1L (hardcoded for testing)
        // In production: decode JWT, get userId claim
        return 1L;
    }


}
