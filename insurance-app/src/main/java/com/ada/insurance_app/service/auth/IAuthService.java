package com.ada.insurance_app.service.auth;

import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.auth.LoginRequest;
import com.ada.insurance_app.request.auth.RefreshTokenRequest;
import com.ada.insurance_app.request.password.ChangePasswordRequest;
import com.ada.insurance_app.request.password.ForgotPasswordRequest;
import com.ada.insurance_app.request.password.ResetPasswordRequest;
import com.ada.insurance_app.request.user.AddUserRequest;
import com.ada.insurance_app.response.AuthResponse;
import com.ada.insurance_app.response.PasswordResponse;

public interface IAuthService {

    // Authentication methods
    AuthResponse login(LoginRequest request);
    UserDto register(AddUserRequest request);
    UserDto registerCustomer(AddUserRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String token);

    // Password management methods
    PasswordResponse changePassword(ChangePasswordRequest request);
    PasswordResponse forgotPassword(ForgotPasswordRequest request);
    PasswordResponse resetPassword(ResetPasswordRequest request);
}
