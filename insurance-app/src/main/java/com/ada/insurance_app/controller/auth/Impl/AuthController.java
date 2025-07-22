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
public class AuthController implements IAuthController {

    private final IAuthService authService;


    @Override
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Override
    @PostMapping("/register")
    public ResponseEntity<GeneralResponse<UserDto>> register(@Valid @RequestBody AddUserRequest request) {
        UserDto createdUser = authService.register(request);
        return ResponseEntity.ok(GeneralResponse.success("User registered successfully", createdUser));
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
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(authService.changePassword(request));

    }

    @Override
    @PostMapping("/password/forgot")
    public ResponseEntity<PasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @Override
    @PostMapping("/password/reset")
    public ResponseEntity<PasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}