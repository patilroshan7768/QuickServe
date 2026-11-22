package com.quickserve.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.quickserve.entity.Booking;
import com.quickserve.entity.BookingStatus;

public record BookingResponse(
        Long id,
        LocalDate bookingDate,
        LocalTime bookingTime,
        String address,
        BookingStatus status,
        LocalDateTime createdAt,
        Long serviceId,
        String serviceName,
        BigDecimal servicePrice,
        String serviceImageUrl,
        String customerName,
        String customerEmail,
        String customerPhone) {

    public static BookingResponse from(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getBookingDate(),
                b.getBookingTime(),
                b.getAddress(),
                b.getStatus(),
                b.getCreatedAt(),
                b.getService().getId(),
                b.getService().getName(),
                b.getService().getPrice(),
                b.getService().getImageUrl(),
                b.getCustomer().getName(),
                b.getCustomer().getEmail(),
                b.getCustomer().getPhone());
    }
}
