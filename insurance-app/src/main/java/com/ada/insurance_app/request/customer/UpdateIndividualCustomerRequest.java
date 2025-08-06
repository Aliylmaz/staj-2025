package com.ada.insurance_app.request.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateIndividualCustomerRequest extends BaseCustomerRequest{

    @NotBlank
    @Size(min = 11, max = 11, message = "National ID must be 11 characters long")
    private String nationalId;

    private LocalDateTime dateOfBirth;


}
