package com.micora.backend.Repository;

import com.micora.backend.model.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationCodeRepo extends JpaRepository<VerificationCode, Long> {

    List<VerificationCode> findByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(
        Long userId, VerificationCode.Purpose purpose);
}
