package com.ada.insurance_app.request.coverage;

import com.ada.insurance_app.core.enums.InsuranceType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCoverageRequest {
    private String name;
    private String description;
    private BigDecimal basePrice;
    private boolean active;
    private InsuranceType  insuranceType;
}
