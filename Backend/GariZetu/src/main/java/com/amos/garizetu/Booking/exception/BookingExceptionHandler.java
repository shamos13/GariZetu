package com.amos.garizetu.Booking.exception;

import com.amos.garizetu.Booking.controller.BookingController;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice(assignableTypes = BookingController.class)
@Slf4j
public class BookingExceptionHandler {

    @ExceptionHandler(BookingValidationException.class)
    public ResponseEntity<BookingErrorResponse> handleValidation(
            BookingValidationException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.BAD_REQUEST, exception.getMessage(), request);
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<BookingErrorResponse> handleNotFound(
            BookingNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.NOT_FOUND, exception.getMessage(), request);
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<BookingErrorResponse> handleConflict(
            BookingConflictException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.CONFLICT, exception.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BookingErrorResponse> handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(HttpStatus.FORBIDDEN, exception.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<BookingErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        log.warn("Booking data integrity violation: {}", exception.getMessage());
        return buildResponse(
                HttpStatus.CONFLICT,
                "Booking state could not be updated due to conflicting data. Please refresh and try again.",
                request
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<BookingErrorResponse> handleUnexpected(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        String message = exception.getMessage() == null ? "" : exception.getMessage().toLowerCase();
        if (message.contains("no authenticated user")
                || message.contains("authenticated user not found")
                || message.contains("authentication principal")) {
            return buildResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Your session is no longer valid for this action. Please sign in again.",
                    request
            );
        }

        log.error("Unhandled booking runtime error", exception);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unable to process booking request right now. Please try again.",
                request
        );
    }

    private ResponseEntity<BookingErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        BookingErrorResponse payload = new BookingErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(status).body(payload);
    }
}
