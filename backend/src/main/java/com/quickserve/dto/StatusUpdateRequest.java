package com.quickserve.dto;

import com.quickserve.entity.BookingStatus;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Status is required")
        BookingStatus status) {
}
