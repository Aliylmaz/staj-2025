package com.ada.insurance_app.request.customer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AddIndividualCustomerRequest extends BaseCustomerRequest {
    @NotNull
    private String nationalId;

    @NotNull
    private LocalDateTime dateOfBirth;
}
