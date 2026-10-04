package com.micora.backend.controller;

import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));  // hash it here
        user.setRole(User.Role.CUSTOMER);  // new signups are always customers, not admins
        user.setCreatedAt(java.time.LocalDateTime.now());
        user.setUpdatedAt(java.time.LocalDateTime.now());

        return userRepo.save(user);
    }

    // A small "record" — a lightweight class just to represent the incoming JSON shape
    public record RegisterRequest(String name, String email, String password) {}
}
