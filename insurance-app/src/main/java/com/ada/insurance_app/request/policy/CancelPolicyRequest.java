package com.ada.insurance_app.request.policy;

import com.ada.insurance_app.core.enums.PolicyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CancelPolicyRequest {

    @NotNull(message = "Policy ID must not be null")
    private UUID policyId;

    @NotNull(message = "Cancellation reason must not be null")
    private String cancelationReason;

    private PolicyStatus status = PolicyStatus.CANCELLED; // Default to CANCELLED status

    ;
}
