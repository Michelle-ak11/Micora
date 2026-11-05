package com.micora.backend.controller;

import com.micora.backend.Email.CodeService;
import com.micora.backend.Repository.OrderRepo;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.model.Order;
import com.micora.backend.model.User;
import com.micora.backend.model.VerificationCode;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepo userRepo;
    private final OrderRepo orderRepo;
    private final PasswordEncoder passwordEncoder;
    private final CodeService codeService;

    public UserController(UserRepo userRepo, OrderRepo orderRepo,
                          PasswordEncoder passwordEncoder, CodeService codeService) {
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
        this.passwordEncoder = passwordEncoder;
        this.codeService = codeService;
    }

    // Admin: list all users
    @GetMapping
    public List<UserSummary> getAllUsers() {
        return userRepo.findAll().stream().map(this::toSummary).toList();
    }

    // Admin: one user with their orders
    @GetMapping("/{id}")
    public UserDetail getUser(@PathVariable Long id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new UserDetail(toSummary(user), orderRepo.findByCustomerId(id));
    }

    // Admin: switch an account on or off
    @PatchMapping("/{id}/active")
    public UserSummary setActive(@PathVariable Long id,
                                 @RequestBody ActiveRequest request,
                                 Authentication authentication) {
        Long adminId = Long.parseLong(authentication.getName());

        if (adminId.equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't deactivate your own account");
        }

        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setActive(request.active());
        user.setUpdatedAt(LocalDateTime.now());
        return toSummary(userRepo.save(user));
    }

    // Customer: email me a code to close my account
    @PostMapping("/me/close-account/send-code")
    public Map<String, String> sendCloseAccountCode(Authentication authentication) {
        User user = currentUser(authentication);

        if (user.getRole() == User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin accounts can't be closed here");
        }

        codeService.sendCode(user, VerificationCode.Purpose.CLOSE_ACCOUNT);
        return Map.of("message", "We've sent a code to your email");
    }

    // Customer: close my own account (password OR emailed code)
    @PatchMapping("/me/deactivate")
    public UserSummary closeMyAccount(@RequestBody CloseAccountRequest request, Authentication authentication) {
        User user = currentUser(authentication);

        if (user.getRole() == User.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin accounts can't be closed here");
        }

        boolean inProgress = orderRepo.findByCustomerId(user.getId()).stream()
            .anyMatch(o -> o.getStatus() == Order.Status.PRINTING || o.getStatus() == Order.Status.READY);
        if (inProgress) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have orders in progress");
        }

        boolean passwordOk = request.password() != null
            && passwordEncoder.matches(request.password(), user.getPasswordHash());

        if (!passwordOk) {
            if (request.code() != null) {
                codeService.verifyCode(user, VerificationCode.Purpose.CLOSE_ACCOUNT, request.code());
            } else if (request.password() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect password");
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Confirm with your password or an emailed code");
            }
        }

        user.setActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        return toSummary(userRepo.save(user));
    }

    private User currentUser(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        return userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserSummary toSummary(User u) {
        return new UserSummary(u.getId(), u.getUsername(), u.getEmail(),
            u.getRole().name(), u.getActive(), u.getCreatedAt());
    }

    public record UserSummary(Long id, String username, String email,
                              String role, Boolean active, LocalDateTime createdAt) {}

    public record UserDetail(UserSummary user, List<Order> orders) {}

    public record ActiveRequest(Boolean active) {}

    public record CloseAccountRequest(String password, String code) {}
}