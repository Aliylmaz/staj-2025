package com.ada.insurance_app.request.policy;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.core.enums.PolicyStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
public class CreatePolicyRequest {

    @NotNull(message = "Customer ID must not be null")
    private UUID customerId;

    private UUID agentId; // Opsiyonel olabilir

    @NotNull(message = "Policy status must not be null")
    private PolicyStatus status;

    @NotNull(message = "Policy start date is required")
    private LocalDate startDate;

    @NotNull(message = "Policy end date is required")
    private LocalDate endDate;

    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Premium must be greater than 0")
    private BigDecimal premium;

    @NotNull(message = "Insurance type must not be null")
    private InsuranceType insuranceType;

    private Set<UUID> coverageIds;

    // Sigorta tipine göre opsiyonel alanlar
    private UUID vehicleId;
    private UUID healthDetailId;
    private UUID homeDetailId;
}