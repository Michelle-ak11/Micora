package com.micora.backend.controller;

import com.micora.backend.Repository.OrderRepo;
import com.micora.backend.Repository.PaymentRepo;
import com.micora.backend.Repository.ServiceRepo;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.Order;
import com.micora.backend.model.Payment;
import com.micora.backend.model.Service;
import com.micora.backend.model.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final ServiceRepo serviceRepo;
    private final PaymentRepo paymentRepo;

    public OrderController(OrderRepo orderRepo, UserRepo userRepo,
                           ServiceRepo serviceRepo, PaymentRepo paymentRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.serviceRepo = serviceRepo;
        this.paymentRepo = paymentRepo;
    }

    // Admin: all orders
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    // Admin: one customer's orders
    @GetMapping("/customer/{customerId}")
    public List<Order> getOrdersByCustomer(@PathVariable Long customerId) {
        return orderRepo.findByCustomerId(customerId);
    }

    // Customer: my own orders
    @GetMapping("/me")
    public List<Order> getMyOrders(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return orderRepo.findByCustomerId(userId);
    }

    // Customer: place an order
    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        if (request.quantity() == null || request.quantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        User customer = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        Service service = serviceRepo.findById(request.serviceId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service is not available");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setService(service);
        order.setQuantity(request.quantity());
        order.setDesignFileUrl(request.designFileUrl());

        // Price is calculated on the server: service base price x quantity
        order.setQuotedPrice(service.getBasePrice().multiply(BigDecimal.valueOf(request.quantity())));

        order.setStatus(Order.Status.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepo.save(order);
    }

    // Admin: move an order through Pending -> Printing -> Ready -> Delivered
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

    // Customer: cancel my own order (only while pending and unpaid)
    @PatchMapping("/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your order");
        }
        if (order.getStatus() != Order.Status.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending orders can be cancelled");
        }
        if (paymentRepo.existsByOrderIdAndStatus(order.getId(), Payment.Status.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid orders can't be cancelled");
        }

        order.setStatus(Order.Status.CANCELLED);
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