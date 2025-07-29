package com.ada.insurance_app.request.customer;

import com.ada.insurance_app.core.validation.ValidCustomerRequest;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
@ValidCustomerRequest
public abstract class BaseCustomerRequest {
    @NotNull
    private UUID userId;
    private String customerNumber;
    private String address;
    private String city;
    private String country;
    private String postalCode;
}