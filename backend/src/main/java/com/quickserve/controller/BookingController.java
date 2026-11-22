package com.quickserve.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quickserve.dto.BookingRequest;
import com.quickserve.dto.BookingResponse;
import com.quickserve.dto.BookingStats;
import com.quickserve.dto.StatusUpdateRequest;
import com.quickserve.entity.BookingStatus;
import com.quickserve.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request,
                                                  Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.create(authentication.getName(), request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<BookingResponse> myBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<BookingResponse> getAll(@RequestParam(required = false) BookingStatus status,
                                        @RequestParam(required = false) String search) {
        return bookingService.getAll(status, search);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public BookingStats stats() {
        return bookingService.getStats();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public BookingResponse updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status());
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public BookingResponse cancel(@PathVariable Long id, Authentication authentication) {
        return bookingService.cancel(authentication.getName(), id);
    }
}
