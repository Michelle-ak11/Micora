package com.micora.backend.controller;

import com.micora.backend.Email.EmailService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/test-email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public String test(@RequestBody TestRequest request) {
        emailService.send(request.to(), "MICORA test", "<p>If you can read this, email works.</p>");
        return "sent";
    }

    public record TestRequest(String to) {}
}
