
// PasswordResetTokenRepository
package com.ada.insurance_app.repository.auth;

import com.ada.insurance_app.entity.PasswordResetToken;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.core.enums.PasswordResetTokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByPasswordResetToken(String token);

    List<PasswordResetToken> findAllByUser(User user);

    List<PasswordResetToken> findAllByUserAndPasswordResetTokenStatus(User user, PasswordResetTokenStatus status);

    List<PasswordResetToken> findAllByPasswordResetTokenStatusAndExpiresAtBefore(
            PasswordResetTokenStatus status, LocalDateTime expiredBefore);

    @Modifying
    @Query("DELETE FROM PasswordResetToken prt WHERE prt.createdAt < :cutoffDate")
    int deleteByCreatedAtBefore(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT prt FROM PasswordResetToken prt WHERE prt.user = :user " +
            "AND prt.passwordResetTokenStatus = 'ACTIVE' " +
            "AND prt.expiresAt > :now " +
            "AND prt.used = false")
    List<PasswordResetToken> findValidTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    boolean existsByPasswordResetTokenAndPasswordResetTokenStatusAndExpiresAtAfterAndUsedFalse(
            String token, PasswordResetTokenStatus status, LocalDateTime now);
}