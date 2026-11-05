package com.micora.backend.controller;

import com.micora.backend.Email.CodeService;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.Security.JwtService;
import com.micora.backend.model.User;
import com.micora.backend.model.VerificationCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CodeService codeService;

    public AuthController(UserRepo userRepo, PasswordEncoder passwordEncoder,
                          JwtService jwtService, CodeService codeService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.codeService = codeService;
    }

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String email = request.email() == null ? "" : request.email().trim();
        String password = request.password();

        if (username.isEmpty() || username.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Username is required and can't contain @");
        }
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address");
        }
        if (password == null || password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Password must be at least 8 characters");
        }

        User existingByEmail = userRepo.findByEmail(email).orElse(null);
        if (existingByEmail != null && Boolean.TRUE.equals(existingByEmail.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User existingByUsername = userRepo.findByUsername(username).orElse(null);
        if (existingByUsername != null
            && (existingByEmail == null || !existingByUsername.getId().equals(existingByEmail.getId()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }

        // Reuse an earlier unverified attempt on this email, otherwise start a new account
        User user = existingByEmail != null ? existingByEmail : new User();
        if (existingByEmail == null) {
            user.setRole(User.Role.CUSTOMER);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
        }
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        codeService.sendCode(user, VerificationCode.Purpose.VERIFY_EMAIL);

        return Map.of("message", "Account created. We've sent a code to your email", "email", email);
    }

    @PostMapping("/verify-email")
    public LoginResponse verifyEmail(@RequestBody VerifyEmailRequest request) {
        String email = request.email() == null ? "" : request.email().trim();

        User user = userRepo.findByEmail(email)
            .filter(u -> Boolean.TRUE.equals(u.getActive()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired code"));

        codeService.verifyCode(user, VerificationCode.Purpose.VERIFY_EMAIL, request.code());

        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@RequestBody ResendRequest request) {
        if (request.email() != null) {
            userRepo.findByEmail(request.email().trim())
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .filter(u -> !Boolean.TRUE.equals(u.getEmailVerified()))
                .ifPresent(u -> {
                    try {
                        codeService.sendCode(u, VerificationCode.Purpose.VERIFY_EMAIL);
                    } catch (ResponseStatusException e) {
                        // swallowed so the reply is the same for every email
                        log.warn("Could not resend verification code: {}", e.getReason());
                    }
                });
        }
        return Map.of("message", "If that account needs verifying, we've sent a code");
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userRepo.findByUsernameOrEmail(request.identifier(), request.identifier())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request.email() != null) {
            userRepo.findByEmail(request.email().trim())
                .filter(u -> Boolean.TRUE.equals(u.getActive()))
                .ifPresent(u -> {
                    try {
                        codeService.sendCode(u, VerificationCode.Purpose.RESET_PASSWORD);
                    } catch (ResponseStatusException e) {
                        log.warn("Could not send reset code: {}", e.getReason());
                    }
                });
        }
        return Map.of("message", "If that email has an account, we've sent a code");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.newPassword() == null || request.newPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }

        String email = request.email() == null ? "" : request.email().trim();
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired code"));

        codeService.verifyCode(user, VerificationCode.Purpose.RESET_PASSWORD, request.code());

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);

        return Map.of("message", "Password updated. You can log in now");
    }

    public record RegisterRequest(String username, String email, String password) {}

    public record LoginRequest(String identifier, String password) {}

    public record LoginResponse(String token, Long id, String username, String email, String role) {}

    public record VerifyEmailRequest(String email, String code) {}

    public record ResendRequest(String email) {}

    public record ForgotPasswordRequest(String email) {}

    public record ResetPasswordRequest(String email, String code, String newPassword) {}
}