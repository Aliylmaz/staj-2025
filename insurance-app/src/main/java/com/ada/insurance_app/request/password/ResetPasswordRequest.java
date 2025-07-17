package com.ada.insurance_app.request.password;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token must not be blank")
    private String token;

    @NotBlank(message = "New password must not be blank")
    private String newPassword;
}
