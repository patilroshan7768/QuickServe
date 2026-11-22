package com.quickserve.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.quickserve.dto.BookingRequest;
import com.quickserve.dto.BookingResponse;
import com.quickserve.entity.Booking;
import com.quickserve.entity.BookingStatus;
import com.quickserve.entity.Role;
import com.quickserve.entity.Service;
import com.quickserve.entity.User;
import com.quickserve.exception.BadRequestException;
import com.quickserve.exception.ResourceNotFoundException;
import com.quickserve.repository.BookingRepository;
import com.quickserve.repository.ServiceRepository;
import com.quickserve.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking booking(BookingStatus status, String customerEmail) {
        User customer = new User("Asha", customerEmail, "hash", null, Role.CUSTOMER);
        Service service = new Service();
        service.setName("Home Deep Cleaning");
        service.setPrice(new BigDecimal("1499"));

        Booking b = new Booking();
        b.setCustomer(customer);
        b.setService(service);
        b.setBookingDate(LocalDate.now().plusDays(3));
        b.setBookingTime(LocalTime.of(10, 0));
        b.setAddress("12 MG Road");
        b.setStatus(status);
        return b;
    }

    @Test
    void updateStatus_pendingToApproved_succeeds() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.PENDING, "asha@example.com")));

        BookingResponse response = bookingService.updateStatus(1L, BookingStatus.APPROVED);

        assertEquals(BookingStatus.APPROVED, response.status());
    }

    @Test
    void updateStatus_pendingToCompleted_isRejected() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.PENDING, "asha@example.com")));

        assertThrows(BadRequestException.class,
                () -> bookingService.updateStatus(1L, BookingStatus.COMPLETED));
    }

    @Test
    void updateStatus_completedToApproved_isRejected() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.COMPLETED, "asha@example.com")));

        assertThrows(BadRequestException.class,
                () -> bookingService.updateStatus(1L, BookingStatus.APPROVED));
    }

    @Test
    void updateStatus_unknownBooking_throwsNotFound() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.updateStatus(99L, BookingStatus.APPROVED));
    }

    @Test
    void cancel_ownPendingBooking_succeeds() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.PENDING, "asha@example.com")));

        BookingResponse response = bookingService.cancel("asha@example.com", 1L);

        assertEquals(BookingStatus.CANCELLED, response.status());
    }

    @Test
    void cancel_otherCustomersBooking_looksLikeNotFound() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.PENDING, "asha@example.com")));

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.cancel("someone.else@example.com", 1L));
    }

    @Test
    void cancel_approvedBooking_isRejected() {
        when(bookingRepository.findById(1L))
                .thenReturn(Optional.of(booking(BookingStatus.APPROVED, "asha@example.com")));

        assertThrows(BadRequestException.class,
                () -> bookingService.cancel("asha@example.com", 1L));
    }

    @Test
    void create_pastAppointment_isRejected() {
        User customer = new User("Asha", "asha@example.com", "hash", null, Role.CUSTOMER);
        when(userRepository.findByEmail("asha@example.com")).thenReturn(Optional.of(customer));
        when(serviceRepository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(new Service()));

        BookingRequest request = new BookingRequest(
                1L, LocalDate.now().minusDays(1), LocalTime.of(10, 0), "9876543210", "12 MG Road");

        assertThrows(BadRequestException.class,
                () -> bookingService.create("asha@example.com", request));
    }
}
