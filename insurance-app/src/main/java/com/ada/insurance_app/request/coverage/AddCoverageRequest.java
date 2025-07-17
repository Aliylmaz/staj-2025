package com.ada.insurance_app.request.coverage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddCoverageRequest {

    @NotBlank(message = "Coverage name must not be blank")
    private String name;

    private String description;

    @NotNull(message = "Coverage amount must not be null")
    private BigDecimal coverageAmount;
}
