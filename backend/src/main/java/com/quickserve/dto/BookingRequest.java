package com.quickserve.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BookingRequest(
        @NotNull(message = "Service is required")
        Long serviceId,

        @NotNull(message = "Booking date is required")
        @FutureOrPresent(message = "Booking date cannot be in the past")
        LocalDate bookingDate,

        @NotNull(message = "Booking time is required")
        LocalTime bookingTime,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\+?[0-9]{10,13}$", message = "Enter a valid phone number (10 to 13 digits)")
        String phone,

        @NotBlank(message = "Address is required")
        @Size(max = 500, message = "Address must be at most 500 characters")
        String address) {
}
