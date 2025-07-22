package com.ada.insurance_app.service.auth.token;

import com.ada.insurance_app.entity.PasswordResetToken;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.core.enums.PasswordResetTokenStatus;
import com.ada.insurance_app.repository.auth.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetTokenService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${security.password.resetExpirationMs:3600000}") // Default 1 hour
    private long passwordResetExpirationMs;

    @Transactional
    public PasswordResetToken createPasswordResetToken(User user, String tokenValue) {
        // Invalidate existing active tokens for the user
        invalidateUserTokens(user);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .passwordResetToken(tokenValue)
                .expiresAt(LocalDateTime.now().plusSeconds(passwordResetExpirationMs / 1000))
                .passwordResetTokenStatus(PasswordResetTokenStatus.ACTIVE)
                .used(false)
                .build();

        return passwordResetTokenRepository.save(resetToken);
    }

    public Optional<PasswordResetToken> findValidToken(String token) {
        return passwordResetTokenRepository.findByPasswordResetToken(token.trim())
                .filter(PasswordResetToken::canBeUsed);
    }


    public boolean isTokenValid(String token) {
        return findValidToken(token).isPresent();
    }

    @Transactional
    public boolean useToken(String token) {
        Optional<PasswordResetToken> tokenOpt = findValidToken(token);
        if (tokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = tokenOpt.get();
        resetToken.markAsUsed();
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset token used successfully for user: {}", resetToken.getUser().getEmail());
        return true;
    }

    @Transactional
    public void invalidateUserTokens(User user) {
        passwordResetTokenRepository.findAllByUserAndPasswordResetTokenStatus(user, PasswordResetTokenStatus.ACTIVE)
                .forEach(token -> {
                    token.setPasswordResetTokenStatus(PasswordResetTokenStatus.EXPIRED);
                    passwordResetTokenRepository.save(token);
                });
    }

    @Transactional
    public void markExpiredTokens() {
        passwordResetTokenRepository.findAllByPasswordResetTokenStatusAndExpiresAtBefore(
                        PasswordResetTokenStatus.ACTIVE, LocalDateTime.now())
                .forEach(token -> {
                    token.markAsExpired();
                    passwordResetTokenRepository.save(token);
                });

        log.info("Expired password reset tokens marked");
    }

    @Transactional
    public void cleanupOldTokens(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        int deletedCount = passwordResetTokenRepository.deleteByCreatedAtBefore(cutoffDate);
        log.info("Cleaned up {} old password reset tokens", deletedCount);
    }

    public Optional<User> getUserByToken(String token) {
        return findValidToken(token)
                .map(PasswordResetToken::getUser);
    }

    public boolean isRecentTokenRequest(User user, int minutes) {
        return passwordResetTokenRepository.findAllByUser(user).stream()
                .anyMatch(token -> token.isCreatedRecently(minutes));
    }

    public long getTokenExpiryMinutes(String token) {
        return findValidToken(token)
                .map(PasswordResetToken::getRemainingMinutes)
                .orElse(0L);
    }
}