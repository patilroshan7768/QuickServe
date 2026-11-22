package com.quickserve.service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

import com.quickserve.dto.ServiceRequest;
import com.quickserve.dto.ServiceResponse;
import com.quickserve.entity.Service;
import com.quickserve.exception.ResourceNotFoundException;
import com.quickserve.repository.BookingRepository;
import com.quickserve.repository.ServiceRepository;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository, BookingRepository bookingRepository) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getAll(String category, String search) {
        return serviceRepository.search(clean(category), clean(search))
                .stream().map(ServiceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getById(Long id) {
        return ServiceResponse.from(findActive(id));
    }

    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        Service service = new Service();
        apply(service, request);
        return ServiceResponse.from(serviceRepository.save(service));
    }

    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        Service service = findActive(id);
        apply(service, request);
        return ServiceResponse.from(serviceRepository.save(service));
    }

    @Transactional
    public void delete(Long id) {
        Service service = findActive(id);
        if (bookingRepository.existsByServiceId(id)) {
            // Has booking history: hide it instead of deleting, so old bookings stay valid.
            service.setActive(false);
            serviceRepository.save(service);
        } else {
            serviceRepository.delete(service);
        }
    }

    private Service findActive(Long id) {
        return serviceRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id " + id));
    }

    private void apply(Service service, ServiceRequest r) {
        service.setName(r.name().trim());
        service.setDescription(r.description().trim());
        service.setPrice(r.price());
        service.setCategory(r.category().trim());
        service.setImageUrl(r.imageUrl() == null || r.imageUrl().isBlank() ? null : r.imageUrl().trim());
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
