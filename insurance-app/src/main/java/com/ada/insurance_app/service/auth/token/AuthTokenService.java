package com.ada.insurance_app.service.auth.token;

import com.ada.insurance_app.repository.IAuthRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthTokenService implements IAuthRepository {

    // In-memory storage for refresh tokens: token -> (userId, expiryTime)
    private final Map<String, TokenInfo> refreshTokens = new ConcurrentHashMap<>();
    
    // In-memory storage for password reset tokens: token -> (email, expiryTime)
    private final Map<String, TokenInfo> passwordResetTokens = new ConcurrentHashMap<>();
    
    @Override
    public void saveRefreshToken(UUID userId, String refreshToken, long expiryTimeMs) {
        refreshTokens.put(refreshToken, new TokenInfo(userId.toString(), Instant.now().plusMillis(expiryTimeMs)));
    }

    @Override
    public Optional<UUID> getUserIdByRefreshToken(String refreshToken) {
        TokenInfo info = refreshTokens.get(refreshToken);
        if (info != null && info.isValid()) {
            return Optional.of(UUID.fromString(info.getValue()));
        }
        return Optional.empty();
    }

    @Override
    public void deleteRefreshToken(String refreshToken) {
        refreshTokens.remove(refreshToken);
    }

    @Override
    public boolean isRefreshTokenValid(String refreshToken) {
        TokenInfo info = refreshTokens.get(refreshToken);
        return info != null && info.isValid();
    }

    @Override
    public void savePasswordResetToken(String email, String resetToken, long expiryTimeMs) {
        passwordResetTokens.put(resetToken, new TokenInfo(email, Instant.now().plusMillis(expiryTimeMs)));
    }

    @Override
    public Optional<String> getEmailByResetToken(String resetToken) {
        TokenInfo info = passwordResetTokens.get(resetToken);
        if (info != null && info.isValid()) {
            return Optional.of(info.getValue());
        }
        return Optional.empty();
    }

    @Override
    public void deletePasswordResetToken(String resetToken) {
        passwordResetTokens.remove(resetToken);
    }

    @Override
    public boolean isPasswordResetTokenValid(String resetToken) {
        TokenInfo info = passwordResetTokens.get(resetToken);
        return info != null && info.isValid();
    }

    @Override
    public void deleteAllRefreshTokensByUserId(UUID userId) {
        refreshTokens.entrySet().removeIf(entry -> entry.getValue().getValue().equals(userId.toString()));

    }

    // Helper class to store token information
    private static class TokenInfo {
        private final String value;
        private final Instant expiryTime;
        
        public TokenInfo(String value, Instant expiryTime) {
            this.value = value;
            this.expiryTime = expiryTime;
        }
        
        public String getValue() {
            return value;
        }
        
        public boolean isValid() {
            return Instant.now().isBefore(expiryTime);
        }
    }
}