package com.micora.backend.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity 
@Table(name = "orders")

public class Order {
    
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne                                  // many orders can belong to one customer
    @JoinColumn(name = "customer_id")           // the actual foreign key column name
    private User customer;

    @ManyToOne                                  // many orders can reference one service
    @JoinColumn(name = "service_id")
    private Service service;

    private Integer quantity;

    @Column(name = "design_file_url")
    private String designFileUrl;

    @Column(name = "quoted_price")
    private BigDecimal quotedPrice;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, PRINTING, READY, DELIVERED, CANCELLED
    }

    // ---- Getters and setters ----

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Service getService() { return service; }
    public void setService(Service service) { this.service = service; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getDesignFileUrl() { return designFileUrl; }
    public void setDesignFileUrl(String designFileUrl) { this.designFileUrl = designFileUrl; }

    public BigDecimal getQuotedPrice() { return quotedPrice; }
    public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
