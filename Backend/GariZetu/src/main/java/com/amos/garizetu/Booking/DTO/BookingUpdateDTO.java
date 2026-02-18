package com.amos.garizetu.Booking.DTO;

import com.amos.garizetu.Booking.Enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingUpdateDTO {

    private BookingStatus bookingStatus;
    private String returnLocation;
    private String specialRequest;
    private Double refundAmount;
}
