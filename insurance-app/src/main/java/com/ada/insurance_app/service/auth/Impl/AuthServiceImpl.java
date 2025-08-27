package com.ada.insurance_app.service.auth.Impl;

import com.ada.insurance_app.core.enums.CustomerType;
import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.core.exception.InvalidRequestException;
import com.ada.insurance_app.core.exception.UserNotFoundException;
import com.ada.insurance_app.core.security.JwtTokenProvider;
import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.entity.RefreshToken;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.ICustomerRepository;
import com.ada.insurance_app.repository.auth.User.IUserRepository;
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
import org.springframework.security.authentication.BadCredentialsException;
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
    private final ICustomerRepository customerRepository;

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

            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, refreshTokenValue);



            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken.getToken())
                    .expiresIn(accessTokenExpirationMs / 1000)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();

        } catch (BadCredentialsException ex) {
            log.warn("Login failed due to invalid credentials");
            throw new InvalidRequestException("Invalid email or password"); // kendi custom exception'ını fırlat
        } catch (Exception e) {
            log.error("Login failed", e);
            throw e; // diğer exceptionlar yine yukarı fırlasın
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

        // User oluşturuluyor
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.CUSTOMER);  // Dilersen Role'ü dinamik alabilirsin
        user.setActive(true);
        user = userRepository.save(user);

        // Customer DTO'dan veri alınıyor
        CustomerDto customerDto = request.getCustomer();
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerType(customerDto.getCustomerType());
        customer.setCustomerNumber(UUID.randomUUID().toString().substring(0, 8)); // örnek

        customer.setAddress(customerDto.getAddress());
        customer.setNationalId(customerDto.getNationalId());

        if (customerDto.getCustomerType() == CustomerType.INDIVIDUAL) {
            customer.setDateOfBirth(customerDto.getDateOfBirth());
        } else if (customerDto.getCustomerType() == CustomerType.CORPORATE) {
            customer.setCompanyName(customerDto.getCompanyName());
            customer.setTaxNumber(customerDto.getTaxNumber());
            customer.setCompanyRegistrationNumber(customerDto.getCompanyRegistrationNumber());
            customer.setCity(customerDto.getCity());
            customer.setCountry(customerDto.getCountry());
            customer.setPostalCode(customerDto.getPostalCode());
        }

        customerRepository.save(customer);



        return userInfoMapper.fromUserInfo(user);

        //TODO frontend tarafında register için customer bilgilerinde bireysel ve kurumsal için farklı alanlar olacak şekilde düzenleme yap ona göre bu bilgiler dolacak.
    }

    @Transactional
    @Override
    public UserDto registerCustomer(AddUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }

        // User oluşturuluyor - Customer role ile
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

        // Customer DTO'dan veri alınıyor
        CustomerDto customerDto = request.getCustomer();
        Customer customer = new Customer();
        customer.setUser(user);
        customer.setCustomerType(customerDto.getCustomerType());
        customer.setCustomerNumber("CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        customer.setAddress(customerDto.getAddress());
        customer.setNationalId(customerDto.getNationalId());

        if (customerDto.getCustomerType() == CustomerType.INDIVIDUAL) {
            customer.setDateOfBirth(customerDto.getDateOfBirth());
        } else if (customerDto.getCustomerType() == CustomerType.CORPORATE) {
            customer.setCompanyName(customerDto.getCompanyName());
            customer.setTaxNumber(customerDto.getTaxNumber());
            customer.setCompanyRegistrationNumber(customerDto.getCompanyRegistrationNumber());
            customer.setCity(customerDto.getCity());
            customer.setCountry(customerDto.getCountry());
            customer.setPostalCode(customerDto.getPostalCode());
        }

        customerRepository.save(customer);



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

        return PasswordResponse.builder()
                .success(true)
                .message("Password reset successfully. Please login with your new password.")
                .build();
    }

}