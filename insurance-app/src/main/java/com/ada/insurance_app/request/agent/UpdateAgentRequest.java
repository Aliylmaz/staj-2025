package com.ada.insurance_app.request.agent;

import com.ada.insurance_app.request.user.CreateUserRequest;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAgentRequest {

    @NotBlank(message = "Agent name is required")
    private String name;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 15)
    private String phoneNumber;

    CreateUserRequest user;
}
