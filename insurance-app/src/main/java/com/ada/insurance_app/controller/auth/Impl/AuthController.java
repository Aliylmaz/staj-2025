package com.ada.insurance_app.controller.auth.Impl;

import com.ada.insurance_app.controller.auth.IAuthController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.auth.LoginRequest;
import com.ada.insurance_app.request.auth.RefreshTokenRequest;
import com.ada.insurance_app.request.password.ChangePasswordRequest;
import com.ada.insurance_app.request.password.ForgotPasswordRequest;
import com.ada.insurance_app.request.password.ResetPasswordRequest;
import com.ada.insurance_app.request.user.AddUserRequest;
import com.ada.insurance_app.response.AuthResponse;
import com.ada.insurance_app.response.PasswordResponse;
import com.ada.insurance_app.response.UserResponse;
import com.ada.insurance_app.service.auth.IAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController implements IAuthController {

    private final IAuthService authService;


    @Override
    @PostMapping("/login")
    public ResponseEntity<GeneralResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(GeneralResponse.success("Login successful", authService.login(request)));
    }

    @Override
    @PostMapping("/register")
    public ResponseEntity<GeneralResponse<UserDto>> register(@Valid @RequestBody AddUserRequest request) {
        UserDto createdUser = authService.register(request);
        return ResponseEntity.ok(GeneralResponse.success("User registered successfully", createdUser));
    }

    @Override
    @PostMapping("/register-customer")
    public ResponseEntity<GeneralResponse<UserDto>> registerCustomer(@Valid @RequestBody AddUserRequest request) {
        UserDto createdUser = authService.registerCustomer(request);
        return ResponseEntity.ok(GeneralResponse.success("Customer registered successfully", createdUser));
    }


    @Override
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @Override
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization")String token) {
        authService.logout(token);
        return ResponseEntity.noContent().build();
    }

    @Override
    @PostMapping("/password/change")
    public ResponseEntity<PasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            String username = SecurityUtils.getCurrentUsername();
            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new PasswordResponse(false, "User not logged in"));
            }
            return ResponseEntity.ok(authService.changePassword(request));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new PasswordResponse(false, "Password change operation failed: " + e.getMessage()));
        }
    }

    @Override
    @PostMapping("/password/forgot")
        public ResponseEntity<PasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            return ResponseEntity.ok(authService.forgotPassword(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PasswordResponse(false, "Forgot password operation failed: " + e.getMessage()));
        }
    }

    @Override
    @PostMapping("/password/reset")
    public ResponseEntity<PasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            return ResponseEntity.ok(authService.resetPassword(request));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PasswordResponse(false, "Reset password operation failed: " + e.getMessage()));
        }
    }
}