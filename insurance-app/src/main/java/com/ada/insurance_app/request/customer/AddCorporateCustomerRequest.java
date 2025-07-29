package com.ada.insurance_app.request.customer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCorporateCustomerRequest extends BaseCustomerRequest {
    @NotNull
    private String companyName;

    @NotNull
    private String taxNumber;

    @NotNull
    private String companyRegistrationNumber;
}