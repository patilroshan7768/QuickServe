package com.quickserve.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.transaction.annotation.Transactional;

import com.quickserve.dto.BookingRequest;
import com.quickserve.dto.BookingResponse;
import com.quickserve.dto.BookingStats;
import com.quickserve.entity.Booking;
import com.quickserve.entity.BookingStatus;
import com.quickserve.entity.Service;
import com.quickserve.entity.User;
import com.quickserve.exception.BadRequestException;
import com.quickserve.exception.ResourceNotFoundException;
import com.quickserve.repository.BookingRepository;
import com.quickserve.repository.ServiceRepository;
import com.quickserve.repository.UserRepository;

@org.springframework.stereotype.Service
public class BookingService {

    // What an ADMIN may change a booking to, based on its current status.
    private static final Map<BookingStatus, Set<BookingStatus>> ADMIN_TRANSITIONS = Map.of(
            BookingStatus.PENDING, Set.of(BookingStatus.APPROVED, BookingStatus.REJECTED),
            BookingStatus.APPROVED, Set.of(BookingStatus.COMPLETED));

    private final BookingRepository bookingRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ServiceRepository serviceRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse create(String customerEmail, BookingRequest request) {
        User customer = findUser(customerEmail);
        Service service = serviceRepository.findByIdAndActiveTrue(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found or no longer available"));

        LocalDateTime appointment = LocalDateTime.of(request.bookingDate(), request.bookingTime());
        if (!appointment.isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Appointment time must be in the future");
        }

        // customer is a managed entity, so this change is saved automatically at commit.
        customer.setPhone(request.phone());

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setService(service);
        booking.setBookingDate(request.bookingDate());
        booking.setBookingTime(request.bookingTime());
        booking.setAddress(request.address().trim());
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String customerEmail) {
        return bookingRepository.findByCustomerEmailWithDetails(customerEmail)
                .stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAll(BookingStatus status, String search) {
        List<Booking> bookings = (status == null)
                ? bookingRepository.findAllWithDetails()
                : bookingRepository.findAllByStatusWithDetails(status);

        String term = search == null ? "" : search.trim().toLowerCase();
        return bookings.stream()
                .filter(b -> term.isEmpty()
                        || b.getCustomer().getName().toLowerCase().contains(term)
                        || b.getCustomer().getEmail().toLowerCase().contains(term)
                        || b.getService().getName().toLowerCase().contains(term)
                        || String.valueOf(b.getId()).equals(term))
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional
    public BookingResponse updateStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        Set<BookingStatus> allowed = ADMIN_TRANSITIONS.getOrDefault(booking.getStatus(), Set.of());
        if (!allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Cannot change booking status from " + booking.getStatus() + " to " + newStatus);
        }
        booking.setStatus(newStatus);
        return BookingResponse.from(booking);
    }

    @Transactional
    public BookingResponse cancel(String customerEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id " + bookingId));

        // Someone else's booking looks exactly like a missing one, so IDs can't be probed.
        if (!booking.getCustomer().getEmail().equals(customerEmail)) {
            throw new ResourceNotFoundException("Booking not found with id " + bookingId);
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return BookingResponse.from(booking);
    }

    @Transactional(readOnly = true)
    public BookingStats getStats() {
        return new BookingStats(
                bookingRepository.count(),
                bookingRepository.countByStatus(BookingStatus.PENDING),
                bookingRepository.countByStatus(BookingStatus.APPROVED),
                bookingRepository.countByStatus(BookingStatus.COMPLETED));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
