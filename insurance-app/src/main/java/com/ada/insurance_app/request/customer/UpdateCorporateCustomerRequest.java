package com.ada.insurance_app.request.customer;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCorporateCustomerRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Tax number is required")
    private String taxNumber;

    private String companyRegistrationNumber;

    private String address;
    private String city;
    private String country;
    private String postalCode;
}
