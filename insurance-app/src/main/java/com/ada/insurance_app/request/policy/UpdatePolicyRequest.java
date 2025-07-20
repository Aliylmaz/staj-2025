package com.ada.insurance_app.request.policy;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
public class UpdatePolicyRequest {

    @NotNull(message = "Policy ID must not be null")
    private Long policyId;

    private LocalDate startDate;
    private LocalDate endDate;
    private Set<UUID> coverageIds;
}
