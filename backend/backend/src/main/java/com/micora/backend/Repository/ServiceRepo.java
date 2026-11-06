package com.micora.backend.Repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.micora.backend.model.Service;
import java.util.List;


public interface ServiceRepo extends JpaRepository<Service, Long> {
      List<Service> findByActiveTrue();

    Optional<Service> findByNameIgnoreCase(String name);
}
