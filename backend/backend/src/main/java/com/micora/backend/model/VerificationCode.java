package com.micora.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_codes")
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Purpose purpose;

    @Column(name = "code_hash")
    private String codeHash;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    private Integer attempts = 0;

    private Boolean used = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum Purpose {
        RESET_PASSWORD, VERIFY_EMAIL, CLOSE_ACCOUNT
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Purpose getPurpose() { return purpose; }
    public void setPurpose(Purpose purpose) { this.purpose = purpose; }

    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) { this.codeHash = codeHash; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Boolean getUsed() { return used; }
    public void setUsed(Boolean used) { this.used = used; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}