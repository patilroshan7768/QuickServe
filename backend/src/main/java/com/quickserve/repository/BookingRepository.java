package com.quickserve.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.quickserve.entity.Booking;
import com.quickserve.entity.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            select b from Booking b
            join fetch b.customer join fetch b.service
            order by b.createdAt desc
            """)
    List<Booking> findAllWithDetails();

    @Query("""
            select b from Booking b
            join fetch b.customer join fetch b.service
            where b.status = :status
            order by b.createdAt desc
            """)
    List<Booking> findAllByStatusWithDetails(@Param("status") BookingStatus status);

    @Query("""
            select b from Booking b
            join fetch b.customer join fetch b.service
            where b.customer.email = :email
            order by b.createdAt desc
            """)
    List<Booking> findByCustomerEmailWithDetails(@Param("email") String email);

    boolean existsByServiceId(Long serviceId);

    long countByStatus(BookingStatus status);
}
