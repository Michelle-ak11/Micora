package com.micora.backend.Repository;

import com.micora.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {

    // Custom query method — Spring auto-generates the implementation
    // just from the method name itself
    Optional<User> findByEmail(String email);
}
