package com.ada.insurance_app.request.user;

import com.ada.insurance_app.core.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ChangeRoleRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Role is required")
    private Role role;
} 