package com.micora.backend.controller;

import com.micora.backend.Repository.ServiceRepo;
import com.micora.backend.model.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceRepo serviceRepo;

    public ServiceController(ServiceRepo serviceRepo) {
        this.serviceRepo = serviceRepo;
    }

    // Public: only active services
    @GetMapping
    public List<Service> getActiveServices() {
        return serviceRepo.findByActiveTrue();
    }

    // Admin: everything, including inactive
    @GetMapping("/all")
    public List<Service> getAllServices() {
        return serviceRepo.findAll();
    }

    @PostMapping
    public Service create(@RequestBody ServiceRequest request) {
        validate(request);
        Service service = new Service();
        apply(service, request);
        service.setActive(true);
        service.setCreatedAt(LocalDateTime.now());
        service.setUpdatedAt(LocalDateTime.now());
        return serviceRepo.save(service);
    }

    // Admin: add or update many services at once (matched by name)
    @PostMapping("/bulk")
    @Transactional
    public List<Service> bulk(@RequestBody List<ServiceRequest> requests) {
        for (ServiceRequest r : requests) {
            validate(r);
        }

        List<Service> saved = new ArrayList<>();
        for (ServiceRequest r : requests) {
            LocalDateTime now = LocalDateTime.now();
            Service service = serviceRepo.findByNameIgnoreCase(r.name().trim()).orElse(null);
            if (service == null) {
                service = new Service();
                service.setActive(true);
                service.setCreatedAt(now);
            }
            apply(service, r);
            service.setUpdatedAt(now);
            saved.add(serviceRepo.save(service));
        }
        return saved;
    }

    @PutMapping("/{id}")
    public Service update(@PathVariable Long id, @RequestBody ServiceRequest request) {
        validate(request);
        Service service = serviceRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        apply(service, request);
        service.setUpdatedAt(LocalDateTime.now());
        return serviceRepo.save(service);
    }

    @PatchMapping("/{id}/active")
    public Service setActive(@PathVariable Long id, @RequestBody ActiveRequest request) {
        Service service = serviceRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
        service.setActive(request.active());
        service.setUpdatedAt(LocalDateTime.now());
        return serviceRepo.save(service);
    }

    private void validate(ServiceRequest r) {
        if (r.name() == null || r.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (r.basePrice() == null || r.basePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be above zero");
        }
    }

    private void apply(Service service, ServiceRequest r) {
        service.setName(r.name().trim());
        service.setDescription(r.description());
        service.setCategory(r.category());
        service.setUnit(r.unit());
        service.setBasePrice(r.basePrice());
    }

    public record ServiceRequest(String name, String description, String category, String unit, BigDecimal basePrice) {}

    public record ActiveRequest(Boolean active) {}
}