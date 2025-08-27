package com.ada.insurance_app.service.auth.token;

import com.ada.insurance_app.entity.RefreshToken;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.repository.auth.RefreshTokenRepository;
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
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refreshExpirationMs}")
    private long refreshTokenExpirationMs;

    @Transactional
    public RefreshToken createRefreshToken(User user, String tokenValue) {
        // Delete existing refresh token for user (one token per user policy)
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenValue)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(RefreshToken::isActive);
    }

    public boolean isTokenValid(String token) {
        return findByToken(token).isPresent();
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }

    @Transactional
    public void revokeAllTokensByUser(User user) {
        refreshTokenRepository.findAllByUser(user)
                .forEach(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());

    }

    public Optional<User> getUserByToken(String token) {
        return findByToken(token)
                .map(RefreshToken::getUser);
    }
}