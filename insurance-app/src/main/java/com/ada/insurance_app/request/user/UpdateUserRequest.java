package com.ada.insurance_app.request.user;

import com.ada.insurance_app.core.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class UpdateUserRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private String username;

    private String firstName;

    private String lastName;

    @Email(message = "Email must be valid")
    private String email;

    private String password;

    private String phoneNumber;

    private Role role;
}
