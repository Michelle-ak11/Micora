package com.micora.backend.Repository;

import com.micora.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceRepo extends JpaRepository<Invoice, Long> {

    List<Invoice> findByOrderCustomerIdOrderByIssuedAtDesc(Long customerId);

    List<Invoice> findAllByOrderByIssuedAtDesc();
}