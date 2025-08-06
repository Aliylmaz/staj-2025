package com.ada.insurance_app.controller.auth;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.auth.LoginRequest;
import com.ada.insurance_app.request.auth.RefreshTokenRequest;
import com.ada.insurance_app.request.password.ChangePasswordRequest;
import com.ada.insurance_app.request.password.ForgotPasswordRequest;
import com.ada.insurance_app.request.password.ResetPasswordRequest;
import com.ada.insurance_app.request.user.AddUserRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.response.AuthResponse;
import com.ada.insurance_app.response.PasswordResponse;
import com.ada.insurance_app.response.UserResponse;
import org.springframework.http.ResponseEntity;

public interface IAuthController {

    ResponseEntity<GeneralResponse<AuthResponse>> login( LoginRequest request);

    ResponseEntity<GeneralResponse<UserDto>> register(AddUserRequest request);

    // Customer specific registration endpoint
    ResponseEntity<GeneralResponse<UserDto>> registerCustomer(AddUserRequest request);

    ResponseEntity<AuthResponse> refreshToken( RefreshTokenRequest request);

    ResponseEntity<Void> logout( String token);

    ResponseEntity<PasswordResponse> changePassword( ChangePasswordRequest request);

    ResponseEntity<PasswordResponse> forgotPassword( ForgotPasswordRequest request);

    ResponseEntity<PasswordResponse> resetPassword(ResetPasswordRequest request);
}
