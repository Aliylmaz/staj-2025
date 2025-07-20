package com.ada.insurance_app.request.customer;

import com.ada.insurance_app.core.enums.CustomerType;
import com.ada.insurance_app.core.validation.ValidCustomerRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@ValidCustomerRequest
public class AddCustomerRequest {

    @NotNull
    private UUID userId;

    @NotNull
    private CustomerType customerType;

    private String customerNumber;

    // Individual
    private String nationalId;
    private LocalDateTime dateOfBirth;

    // Corporate
    private String companyName;
    private String taxNumber;
    private String companyRegistrationNumber;

    private String address;
    private String city;
    private String country;
    private String postalCode;
}
