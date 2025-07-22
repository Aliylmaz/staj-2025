package com.ada.insurance_app.service.auth.token;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenService passwordResetTokenService;

    /**
     * Clean up expired refresh tokens every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredRefreshTokens() {
        try {
            refreshTokenService.deleteExpiredTokens();
            log.debug("Scheduled cleanup of expired refresh tokens completed");
        } catch (Exception e) {
            log.error("Error during scheduled refresh token cleanup", e);
        }
    }

    /**
     * Mark expired password reset tokens every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    public void markExpiredPasswordResetTokens() {
        try {
            passwordResetTokenService.markExpiredTokens();
            log.debug("Scheduled marking of expired password reset tokens completed");
        } catch (Exception e) {
            log.error("Error during scheduled password reset token expiry marking", e);
        }
    }

    /**
     * Clean up old password reset tokens every day at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldPasswordResetTokens() {
        try {
            // Clean up tokens older than 30 days
            passwordResetTokenService.cleanupOldTokens(30);
            log.info("Scheduled cleanup of old password reset tokens completed");
        } catch (Exception e) {
            log.error("Error during scheduled password reset token cleanup", e);
        }
    }
}