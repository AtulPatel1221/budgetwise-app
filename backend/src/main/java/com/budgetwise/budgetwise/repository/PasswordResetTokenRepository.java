package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    @Transactional   // <-- ⭐ REQUIRED FIX
    void deleteByUserId(Long userId);
}
