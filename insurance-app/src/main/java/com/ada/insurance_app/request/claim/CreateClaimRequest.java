package com.ada.insurance_app.request.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateClaimRequest {

    @NotNull(message = "Policy ID must not be null")
    private Long policyId;

    @NotNull(message = "Incident date must not be null")
    private LocalDate incidentDate;

    @NotBlank(message = "Claim description must not be blank")
    private String description;

    @NotBlank(message = "Claim status must not be blank")
    private String status;

    private String documentUrl; // Optional: document path or URL
}
