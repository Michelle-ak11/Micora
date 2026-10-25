package com.micora.backend.controller;


import com.micora.backend.Repository.OrderRepo;
import com.micora.backend.Repository.ServiceRepo;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.Order;
import com.micora.backend.model.Service;
import com.micora.backend.model.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final ServiceRepo serviceRepo;

    public OrderController(OrderRepo orderRepo, UserRepo userRepo, ServiceRepo serviceRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.serviceRepo = serviceRepo;
    }
        @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
    @GetMapping("/customer/{customerId}")
public List<Order> getOrdersByCustomer(@PathVariable Long customerId) {
    return orderRepo.findByCustomerId(customerId);
}

@GetMapping("/me")
public List<Order> getMyOrders(Authentication authentication) {
    Long userId = Long.parseLong(authentication.getName());
    return orderRepo.findByCustomerId(userId);
}


        @PostMapping
        public Order createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
    Long userId = Long.parseLong(authentication.getName());

    User customer = userRepo.findById(userId)
        .orElseThrow(() -> new RuntimeException("Customer not found"));


              Service service = serviceRepo.findById(request.serviceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));


        Order order = new Order();
        order.setCustomer(customer);
        order.setService(service);
        order.setQuantity(request.quantity());
        order.setDesignFileUrl(request.designFileUrl());

        // Calculate price: service base price × quantity
        order.setQuotedPrice(service.getBasePrice().multiply(java.math.BigDecimal.valueOf(request.quantity())));

        order.setStatus(Order.Status.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepo.save(order);
    }

    @PatchMapping("/{id}/status")
public Order updateStatus(@PathVariable Long id, @RequestBody UpdateStatusRequest request) {
    Order order = orderRepo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

    Order.Status current = order.getStatus();
    Order.Status next = request.status();

    boolean allowed =
        (current == Order.Status.PENDING && (next == Order.Status.PRINTING || next == Order.Status.CANCELLED)) ||
        (current == Order.Status.PRINTING && next == Order.Status.READY) ||
        (current == Order.Status.READY && next == Order.Status.DELIVERED);

  if (!allowed) {
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "Cannot change status from " + current + " to " + next);
}

    order.setStatus(next);
    order.setUpdatedAt(LocalDateTime.now());
    return orderRepo.save(order);
}

public record UpdateStatusRequest(Order.Status status) {}

     public record CreateOrderRequest(
    
        Long serviceId,
        Integer quantity,
        String designFileUrl
    ) {}
}
