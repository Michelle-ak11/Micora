 package com.micora.backend.controller;

import com.micora.backend.Email.CodeService;
import com.micora.backend.Repository.UserRepo;
import com.micora.backend.Security.JwtService;
import com.micora.backend.model.User;
import com.micora.backend.model.VerificationCode;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    private final UserRepo userRepo = mock(UserRepo.class);
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private final JwtService jwtService = mock(JwtService.class);
    private final CodeService codeService = mock(CodeService.class);
    private final AuthController controller =
        new AuthController(userRepo, encoder, jwtService, codeService);

    private User user(boolean verified, boolean active) {
        User u = new User();
        u.setId(1L);
        u.setUsername("mary");
        u.setEmail("mary@example.com");
        u.setPasswordHash(encoder.encode("secret123"));
        u.setRole(User.Role.CUSTOMER);
        u.setEmailVerified(verified);
        u.setActive(active);
        return u;
    }

    private int codeOf(ResponseStatusException e) {
        return e.getStatusCode().value();
    }

    @Test
    void registerCreatesUnverifiedCustomerAndSendsCode() {
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        controller.register(
            new AuthController.RegisterRequest("mary", "mary@example.com", "secret123"));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepo).save(captor.capture());
        User saved = captor.getValue();

        assertEquals(User.Role.CUSTOMER, saved.getRole());
        assertFalse(saved.getEmailVerified());
        assertNotEquals("secret123", saved.getPasswordHash());
        assertTrue(encoder.matches("secret123", saved.getPasswordHash()));
        verify(codeService).sendCode(any(User.class), eq(VerificationCode.Purpose.VERIFY_EMAIL));
    }

    @Test
    void registerRejectsShortPassword() {
        ResponseStatusException e = assertThrows(ResponseStatusException.class,
            () -> controller.register(
                new AuthController.RegisterRequest("mary", "mary@example.com", "abc")));
        assertEquals(400, codeOf(e));
    }

    @Test
    void registerRejectsUsernameContainingAt() {
        ResponseStatusException e =