package com.micora.backend.Repository;
import com.micora.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepo extends JpaRepository<Order,Long> {
    
}
