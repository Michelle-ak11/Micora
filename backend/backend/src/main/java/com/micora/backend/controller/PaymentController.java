package com.micora.backend.controller;

import com.micora.backend.Repository.InvoiceRepo;
import com.micora.backend.Repository.OrderRepo;
import com.micora.backend.Repository.PaymentRepo;
import com.micora.backend.model.Invoice;
import com.micora.backend.model.Order;
import com.micora.backend.model.Payment;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepo paymentRepo;
    private final InvoiceRepo invoiceRepo;
    private final OrderRepo orderRepo;

    public PaymentController(PaymentRepo paymentRepo, InvoiceRepo invoiceRepo, OrderRepo orderRepo) {
        this.paymentRepo = paymentRepo;
        this.invoiceRepo = invoiceRepo;
        this.orderRepo = orderRepo;
    }

    @PostMapping
    @Transactional
    public Receipt pay(@RequestBody PayRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());

        Order order = orderRepo.findById(request.orderId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getCustomer().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your order");
        }
        if (order.getStatus() == Order.Status.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is cancelled");
        }
        if (paymentRepo.existsByOrderIdAndStatus(order.getId(), Payment.Status.SUCCESS)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order already paid");
        }

        LocalDateTime now = LocalDateTime.now();

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getQuotedPrice());
        payment.setMethod("MOCK");
        payment.setStatus(Payment.Status.SUCCESS);
        payment.setTransactionRef("MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaidAt(now);
        payment.setCreatedAt(now);
        paymentRepo.save(payment);

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setInvoiceNumber(String.format("INV-%d-%04d", now.getYear(), invoiceRepo.count() + 1));
        invoice.setAmount(payment.getAmount());
        invoice.setIssuedAt(now);
        invoiceRepo.save(invoice);

        return new Receipt(
            invoice.getInvoiceNumber(),
            invoice.getIssuedAt(),
            order.getCustomer().getUsername(),
            order.getId(),
            order.getService().getName(),
            order.getQuantity(),
            payment.getAmount(),
            payment.getMethod(),
            payment.getStatus().name(),
            payment.getTransactionRef()
        );
    }

    public record PayRequest(Long orderId) {}

    public record Receipt(
        String invoiceNumber,
        LocalDateTime issuedAt,
        String customer,
        Long orderId,
        String service,
        Integer quantity,
        BigDecimal amountPaid,
        String method,
        String status,
        String transactionRef
    ) {}
}
