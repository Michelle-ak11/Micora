package com.micora.backend.Repository;
import com.micora.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InvoiceRepo extends JpaRepository<Invoice, Long> {
    
}
