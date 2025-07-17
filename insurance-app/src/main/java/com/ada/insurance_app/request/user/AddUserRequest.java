package com.ada.insurance_app.request.user;

import com.ada.insurance_app.core.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class AddUserRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Email must be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotEmpty(message = "At least one role must be assigned")
    private Set<Role> roles; // Role enum kullanıldığı için burada direkt enum olarak tanımlanır

    private String phoneNumber;
}
