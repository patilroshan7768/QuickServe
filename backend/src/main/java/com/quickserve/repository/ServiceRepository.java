package com.quickserve.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.quickserve.entity.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByIdAndActiveTrue(Long id);

    @Query("""
            select s from Service s
            where s.active = true
              and (:category = '' or lower(s.category) = lower(:category))
              and (:search = ''
                   or lower(s.name) like lower(concat('%', :search, '%'))
                   or lower(s.category) like lower(concat('%', :search, '%')))
            order by s.name
            """)
    List<Service> search(@Param("category") String category, @Param("search") String search);
}
