package com.ada.insurance_app.repository;

import java.util.Optional;
import java.util.UUID;

public interface IAuthRepository {
    
    // Token management
    void saveRefreshToken(UUID userId, String refreshToken, long expiryTimeMs);
    Optional<UUID> getUserIdByRefreshToken(String refreshToken);
    void deleteRefreshToken(String refreshToken);
    boolean isRefreshTokenValid(String refreshToken);
    
    // Password reset token management
    void savePasswordResetToken(String email, String resetToken, long expiryTimeMs);
    Optional<String> getEmailByResetToken(String resetToken);
    void deletePasswordResetToken(String resetToken);
    boolean isPasswordResetTokenValid(String resetToken);

    void deleteAllRefreshTokensByUserId(UUID userId);
}