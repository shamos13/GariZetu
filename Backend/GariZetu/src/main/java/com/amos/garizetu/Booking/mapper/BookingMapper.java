package com.amos.garizetu.Booking.mapper;

import com.amos.garizetu.Booking.DTO.BookingResponseDTO;
import com.amos.garizetu.Booking.Entity.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {
    public BookingResponseDTO toResponseDTO(Booking booking) {
        if (booking == null) {
            return null;
        }

        BookingResponseDTO dto = new BookingResponseDTO();

        // Booking identifiers
        dto.setBookingId(booking.getBookingId());
        dto.setCarId(booking.getCar().getCarId());
        dto.setUserId(booking.getUser().getUserId());

        // Car details (from related Car entity)
        dto.setCarMake(booking.getCar().getMake());
        dto.setCarModel(booking.getCar().getVehicleModel());
        dto.setRegistrationNumber(booking.getCar().getRegistrationNumber());
        dto.setColour(booking.getCar().getColour());
        dto.setCarYear(booking.getCar().getYear());

        // User details (from related User entity)
        dto.setUserName(booking.getUser().getUserName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setPhoneNumber(booking.getUser().getPhoneNumber());

        // Booking dates
        dto.setPickupDate(booking.getPickupDate());
        dto.setReturnDate(booking.getReturnDate());

        // Calculate number of days
        dto.setNumberOfDays(booking.getNumberOfDays());

        // Pricing
        dto.setDailyPrice(booking.getDailyPrice());
        dto.setTotalPrice(booking.getTotalPrice());

        // Locations and requests
        dto.setPickupLocation(booking.getPickupLocation());
        dto.setReturnLocation(booking.getReturnLocation());
        dto.setSpecialRequests(booking.getSpecialRequests());

        // Status and timestamps
        dto.setBookingStatus(booking.getBookingStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        return dto;
    }
}
