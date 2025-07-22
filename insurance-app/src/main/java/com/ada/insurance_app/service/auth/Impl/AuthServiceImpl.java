package com.ada.insurance_app.service.auth.Impl;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.core.exception.UserNotFoundException;
import com.ada.insurance_app.core.security.JwtTokenProvider;
import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.IAuthRepository;
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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final IUserRepository userRepository;
    private final IAuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInfoMapper userInfoMapper;

    @Value("${security.jwt.refreshExpirationMs}")
    private long refreshTokenExpirationMs;

    @Value("${security.jwt.expirationMs}")
    private long accessTokenExpirationMs;

    @Value("${security.password.resetExpirationMs:3600000}") // Default 1 hour
    private long passwordResetExpirationMs;

    @Override
    public AuthResponse login(LoginRequest request) {
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
        String refreshToken = UUID.randomUUID().toString();
        
        // Save refresh token
        authRepository.saveRefreshToken(user.getId(), refreshToken, refreshTokenExpirationMs);
        
        // Build and return response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(accessTokenExpirationMs / 1000) // Convert to seconds
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
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
      user.setRole(Role.CUSTOMER); // Sabit rol
      user.setActive(true);

      user = userRepository.save(user);

      return userInfoMapper.fromUserInfo(user);
  }


    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        // Validate refresh token
        if (!authRepository.isRefreshTokenValid(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        
        // Get user ID from refresh token
        UUID userId = authRepository.getUserIdByRefreshToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        
        // Get user details
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Create authentication object
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(), null, null);
        
        // Generate new access token
        String accessToken = jwtTokenProvider.generateToken(authentication);
        
        // Generate new refresh token
        String newRefreshToken = UUID.randomUUID().toString();
        
        // Delete old refresh token and save new one
        authRepository.deleteRefreshToken(refreshToken);
        authRepository.saveRefreshToken(user.getId(), newRefreshToken, refreshTokenExpirationMs);
        
        // Build and return response
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(accessTokenExpirationMs / 1000) // Convert to seconds
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    public void logout(String token) {
        // Delete refresh token
        authRepository.deleteRefreshToken(token);
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

        // Update password and invalidate tokens
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        authRepository.deleteAllRefreshTokensByUserId(user.getId());

        return PasswordResponse.builder()
                .success(true)
                .message("Password updated successfully")
                .build();
    }

    @Override
    public PasswordResponse forgotPassword(ForgotPasswordRequest request) {
        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);
        
        if (user == null) {
            // Don't reveal that the email doesn't exist for security reasons
            return PasswordResponse.builder()
                    .success(true)
                    .message("If your email is registered, you will receive a password reset link")
                    .build();
        }
        
        // Generate reset token
        String resetToken = UUID.randomUUID().toString();
        
        // Save reset token
        authRepository.savePasswordResetToken(user.getEmail(), resetToken, passwordResetExpirationMs);
        
        // In a real application, send an email with the reset token
        // For now, just return the token in the response
        return PasswordResponse.builder()
                .success(true)
                .message("Password reset link sent to your email. Token: " + resetToken)
                .build();
    }

    @Override
    @Transactional
    public PasswordResponse resetPassword(ResetPasswordRequest request) {
        // Validate reset token
        if (!authRepository.isPasswordResetTokenValid(request.getToken())) {
            return PasswordResponse.builder()
                    .success(false)
                    .message("Invalid or expired reset token")
                    .build();
        }
        
        // Get email from reset token
        String email = authRepository.getEmailByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
        
        // Get user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Delete reset token
        authRepository.deletePasswordResetToken(request.getToken());
        
        return PasswordResponse.builder()
                .success(true)
                .message("Password reset successfully")
                .build();
    }
}