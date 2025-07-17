package com.ada.insurance_app.request.policy;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CancelPolicyRequest {

    @NotNull(message = "Policy ID must not be null")
    private UUID policyId;

    @NotNull(message = "Cancellation reason must not be null")
    private String cancelationReason;
}
