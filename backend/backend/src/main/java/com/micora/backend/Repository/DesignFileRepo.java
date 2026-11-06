package com.micora.backend.Repository;

import com.micora.backend.model.DesignFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DesignFileRepo extends JpaRepository<DesignFile, Long> {

    Optional<DesignFile> findByToken(String token);
}