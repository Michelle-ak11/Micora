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
        @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        User customer = userRepo.findById(request.customerId())
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

     public record CreateOrderRequest(
        Long customerId,
        Long serviceId,
        Integer quantity,
        String designFileUrl
    ) {}
}
