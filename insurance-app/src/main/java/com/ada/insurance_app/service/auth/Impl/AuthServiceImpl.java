package com.ada.insurance_app.service.auth.Impl;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.core.exception.UserNotFoundException;
import com.ada.insurance_app.core.security.JwtTokenProvider;
import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.entity.RefreshToken;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.IUserRepository;
import com.ada.insurance_app.request.auth.LoginRequest;
import com.ada.insurance_app.request.auth.RefreshTokenRequest;
import com.ada.insurance_app.request.password.ChangePasswordRequest;
import com.ada.insurance_app.request.password.ForgotPasswordRequest;
import com.ada.insurance_app.request.password.ResetPasswordRequest;
import com.ada.insurance_app.request.user.AddUserRequest;
import com.ada.insurance_app.response.AuthResponse;
import com.ada.insurance_app.response.PasswordResponse;
import com.ada.insurance_app.service.auth.IAuthService;
import com.ada.insurance_app.service.auth.token.RefreshTokenService;
import com.ada.insurance_app.service.auth.token.PasswordResetTokenService;
import com.ada.insurance_app.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final IUserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserInfoMapper userInfoMapper;
    private final EmailService emailService;

    @Value("${security.jwt.expirationMs}")
    private long accessTokenExpirationMs;

    @Value("${security.password.reset.rateLimit.minutes:5}")
    private int passwordResetRateLimitMinutes;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

            // Generate tokens
            String accessToken = jwtTokenProvider.generateToken(authentication);
            String refreshTokenValue = UUID.randomUUID().toString();



            // Create refresh token entity
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, refreshTokenValue);

            log.info("User logged in successfully: {}", user.getEmail());

            // Build and return response
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .expiresIn(accessTokenExpirationMs / 1000) // Convert to seconds
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .build();

        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    @Transactional
    @Override
    public UserDto register(AddUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.CUSTOMER);
        user.setActive(true);

        user = userRepository.save(user);

        log.info("New user registered: {}", user.getEmail());

        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshTokenValue = request.getRefreshToken();

        // Find and validate refresh token
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        User user = refreshToken.getUser();

        // Create authentication object
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, user.getAuthorities());

        // Generate new access token
        String accessToken = jwtTokenProvider.generateToken(authentication);

        // Generate new refresh token
        String newRefreshTokenValue = UUID.randomUUID().toString();

        // Revoke old refresh token and create new one
        refreshTokenService.revokeToken(refreshTokenValue);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, newRefreshTokenValue);

        log.info("Token refreshed successfully for user: {}", user.getEmail());

        // Build and return response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken.getToken())
                .expiresIn(accessTokenExpirationMs / 1000)
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    @Transactional
    public void logout(String token) {
        refreshTokenService.revokeToken(token);
        log.info("User logged out, refresh token revoked");
    }

    @Override
    @Transactional
    public PasswordResponse changePassword(ChangePasswordRequest request) {
        // Get current user
        String currentUsername = SecurityUtils.getCurrentUsername();

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Validate passwords
        if (request.getNewPassword().length() < 8) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Password must be at least 8 characters")
                    .build();
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Invalid current password")
                    .build();
        }

        // Update password and invalidate all refresh tokens
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenService.revokeAllTokensByUser(user);

        log.info("Password changed successfully for user: {}", user.getEmail());

        return PasswordResponse.builder()
                .success(true)
                .message("Password updated successfully. Please login again.")
                .build();
    }

    @Override
    @Transactional
    public PasswordResponse forgotPassword(ForgotPasswordRequest request) {
        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return PasswordResponse.builder()
                    .success(true)
                    .message("If your email is registered, you will receive a password reset link")
                    .build();
        }

        if (passwordResetTokenService.isRecentTokenRequest(user, passwordResetRateLimitMinutes)) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Please wait before requesting another password reset")
                    .build();
        }

        String resetToken = UUID.randomUUID().toString();
        passwordResetTokenService.createPasswordResetToken(user, resetToken);

        log.info("Password reset token generated for user: {}", user.getEmail());


        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

        return PasswordResponse.builder()
                .success(true)
                .message("Password reset link sent to your email")
                .build();
    }


    @Override
    @Transactional
    public PasswordResponse resetPassword(ResetPasswordRequest request) {
        String token = request.getToken().trim();

        // Get user by token first
        User user = passwordResetTokenService.getUserByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        // Then mark token as used
        if (!passwordResetTokenService.useToken(token)) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Invalid or expired reset token")
                    .build();
        }

        // Validate new password
        if (request.getNewPassword().length() < 8) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Password must be at least 8 characters")
                    .build();
        }

        // Save new password and revoke all refresh tokens
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenService.revokeAllTokensByUser(user);

        log.info("Password reset successfully for user: {}", user.getEmail());

        return PasswordResponse.builder()
                .success(true)
                .message("Password reset successfully. Please login with your new password.")
                .build();
    }

}