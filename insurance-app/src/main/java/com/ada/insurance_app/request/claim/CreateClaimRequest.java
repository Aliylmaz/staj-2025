package com.ada.insurance_app.request.claim;

import com.ada.insurance_app.core.enums.ClaimStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateClaimRequest {

    @NotNull(message = "Policy ID must not be null")
    private Long policyId;

    @NotNull(message = "Incident date must not be null")
    private LocalDate incidentDate;

    @NotBlank(message = "Claim description must not be blank")
    private String description;

    private BigDecimal estimatedAmount; // Optional: customer can provide estimated amount

    private boolean notificationsEnabled = true; // Optional: default to true

    private String claimType = "CLAIM_DOCUMENT"; // Default claim type as String

    private ClaimStatus status = ClaimStatus.SUBMITTED;
}
