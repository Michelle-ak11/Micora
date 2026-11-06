package com.micora.backend.controller;

import com.micora.backend.Repository.InvoiceRepo;
import com.micora.backend.Repository.PaymentRepo;
import com.micora.backend.model.Invoice;
import com.micora.backend.model.Order;
import com.micora.backend.model.Payment;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceRepo invoiceRepo;
    private final PaymentRepo paymentRepo;

    public InvoiceController(InvoiceRepo invoiceRepo, PaymentRepo paymentRepo) {
        this.invoiceRepo = invoiceRepo;
        this.paymentRepo = paymentRepo;
    }

    // Customer: my invoices
    @GetMapping("/me")
    public List<Receipt> myInvoices(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return invoiceRepo.findByOrderCustomerIdOrderByIssuedAtDesc(userId)
            .stream().map(this::toReceipt).toList();
    }

    // Admin: every invoice
    @GetMapping
    public List<Receipt> allInvoices() {
        return invoiceRepo.findAllByOrderByIssuedAtDesc()
            .stream().map(this::toReceipt).toList();
    }

    // Customer (own) or admin (any): one invoice
    @GetMapping("/{id}")
    public Receipt getInvoice(@PathVariable Long id, Authentication authentication) {
        Invoice invoice = invoiceRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        Long userId = Long.parseLong(authentication.getName());
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !invoice.getOrder().getCustomer().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This is not your invoice");
        }
        return toReceipt(invoice);
    }

    private Receipt toReceipt(Invoice invoice) {
        Order order = invoice.getOrder();
        Payment payment = paymentRepo
            .findFirstByOrderIdAndStatus(order.getId(), Payment.Status.SUCCESS)
            .orElse(null);

        BigDecimal paid = payment != null ? payment.getAmount() : BigDecimal.ZERO;

        return new Receipt(
            invoice.getId(),
            invoice.getInvoiceNumber(),
            order.getCustomer().getUsername(),
            order.getCustomer().getEmail(),
            order.getId(),
            order.getService().getName(),
            order.getQuantity(),
            paid,
            order.getQuotedPrice().subtract(paid),
            payment != null ? payment.getPaidAt() : invoice.getIssuedAt(),
            payment != null ? payment.getTransactionRef() : null,
            payment != null ? payment.getStatus().name() : "UNPAID"
        );
    }

    public record Receipt(
        Long invoiceId,
        String invoiceNumber,
        String name,
        String email,
        Long orderId,
        String service,
        Integer quantity,
        BigDecimal amountPaid,
        BigDecimal balance,
        LocalDateTime paymentDate,
        String transactionRef,
        String status
    ) {}
}