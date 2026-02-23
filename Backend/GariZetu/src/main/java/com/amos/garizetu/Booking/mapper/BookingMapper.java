package com.amos.garizetu.Booking.mapper;

import com.amos.garizetu.Booking.DTO.BookingCreateRequest;
import com.amos.garizetu.Booking.DTO.BookingResponseDTO;
import com.amos.garizetu.Booking.Entity.Booking;
import com.amos.garizetu.Car.Entity.Car;
import com.amos.garizetu.User.Entity.User;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    // Mapping Booking entity to BookingResponseDTO
    // The response the customer gets
    public BookingResponseDTO toResponseDTO(Booking booking) {
        if (booking == null) {
            return null;
        }

        BookingResponseDTO dto = new BookingResponseDTO();
        Car car = booking.getCar();
        User user = booking.getUser();

        // Booking identifiers
        dto.setBookingId(booking.getBookingId());
        if (car != null) {
            dto.setCarId(car.getCarId());
        }
        if (user != null) {
            dto.setUserId(user.getUserId());
        }

        // Car details (from related Car entity)
        if (car != null) {
            dto.setCarMake(car.getMake());
            dto.setCarModel(car.getVehicleModel());
            dto.setRegistrationNumber(car.getRegistrationNumber());
            dto.setColour(car.getColour());
            dto.setCarYear(car.getYear());
        }

        // User details (from related User entity)
        if (user != null) {
            dto.setUserName(user.getUserName());
            dto.setUserEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
        }

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
        dto.setPaymentStatus(booking.getPaymentStatus());
        dto.setPaymentReference(booking.getPaymentReference());
        dto.setPaymentMethod(booking.getPaymentMethod());
        dto.setPaymentSimulatedAt(booking.getPaymentSimulatedAt());
        dto.setPaymentExpiresAt(booking.getPaymentExpiresAt());
        dto.setAdminNotifiedAt(booking.getAdminNotifiedAt());
        dto.setAdminNotificationRead(booking.isAdminNotificationRead());
        dto.setAdminNotificationReadAt(booking.getAdminNotificationReadAt());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());

        return dto;
    }

    // Mapping BookingRequestDTO to Entity
    // Request sent by the Customer
    public Booking toEntity(BookingCreateRequest bookingCreateRequest, User user, Car car) {
        if (bookingCreateRequest == null || user == null || car == null) {
            return null;
        }

        Booking booking = new Booking();
        booking.setPickupDate(bookingCreateRequest.getPickupDate());
        booking.setReturnDate(bookingCreateRequest.getReturnDate());
        booking.setPickupLocation(bookingCreateRequest.getPickupLocation());
        //use pickup location if returnLocation is not provided
        booking.setReturnLocation(bookingCreateRequest.getReturnLocation() !=null ? bookingCreateRequest.getReturnLocation() : bookingCreateRequest.getPickupLocation());
        booking.setSpecialRequests(bookingCreateRequest.getSpecialRequests());
        booking.setUser(user);
        booking.setCar(car);
        return booking;

    }
}
