package com.micora.backend.Repository;

import com.micora.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepo extends JpaRepository<Payment, Long> {

    List<Payment> findByOrderCustomerId(Long customerId);

    boolean existsByOrderIdAndStatus(Long orderId, Payment.Status status);
}
