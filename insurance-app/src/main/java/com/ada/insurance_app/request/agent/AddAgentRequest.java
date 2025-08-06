package com.ada.insurance_app.request.agent;

import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.user.CreateUserRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddAgentRequest {

    @NotBlank(message = "name is required")
    @Size(min = 4, max = 30, message = "name must be between 4 and 30 characters")
    private String name;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Size(max = 15, message = "Phone number must be less than 15 characters")
    private String phoneNumber;


    @Valid
    private CreateUserRequest user;

}
