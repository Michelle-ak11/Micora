
package com.micora.backend.Email;

import com.micora.backend.Repository.VerificationCodeRepo;
import com.micora.backend.model.User;
import com.micora.backend.model.VerificationCode;
import com.micora.backend.model.VerificationCode.Purpose;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class CodeService {

    private static final int EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_SECONDS = 60;

    private final SecureRandom random = new SecureRandom();
    private final VerificationCodeRepo codeRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public CodeService(VerificationCodeRepo codeRepo, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.codeRepo = codeRepo;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public void sendCode(User user, Purpose purpose) {
        List<VerificationCode> active =
            codeRepo.findByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(user.getId(), purpose);

        if (!active.isEmpty()
            && active.get(0).getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(RESEND_SECONDS))) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "Please wait a minute before asking for another code");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));

        // Send first, so a failed email doesn't lock the user out of retrying
        emailService.send(user.getEmail(), "Your MICORA verification code",
            "<p>Your MICORA code is <b>" + code + "</b>.</p>"
            + "<p>It expires in " + EXPIRY_MINUTES + " minutes. If you didn't ask for it, ignore this email.</p>");

        for (VerificationCode old : active) {
            old.setUsed(true);
        }
        codeRepo.saveAll(active);

        VerificationCode vc = new VerificationCode();
        vc.setUser(user);
        vc.setPurpose(purpose);
        vc.setCodeHash(passwordEncoder.encode(code));
        vc.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        vc.setAttempts(0);
        vc.setUsed(false);
        vc.setCreatedAt(LocalDateTime.now());
        codeRepo.save(vc);
    }

    // No @Transactional here on purpose: a wrong guess must keep its attempt count
    public void verifyCode(User user, Purpose purpose, String code) {
        List<VerificationCode> active =
            codeRepo.findByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(user.getId(), purpose);

        if (code == null || active.isEmpty()) {
            throw invalid();
        }

        VerificationCode vc = active.get(0);

        if (vc.getExpiresAt().isBefore(LocalDateTime.now()) || vc.getAttempts() >= MAX_ATTEMPTS) {
            throw invalid();
        }

        if (!passwordEncoder.matches(code.trim(), vc.getCodeHash())) {
            vc.setAttempts(vc.getAttempts() + 1);
            codeRepo.save(vc);
            throw invalid();
        }

        vc.setUsed(true);
        codeRepo.save(vc);
    }

    private ResponseStatusException invalid() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired code");
    }
}