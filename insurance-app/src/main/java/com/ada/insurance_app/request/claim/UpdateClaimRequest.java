package com.ada.insurance_app.request.claim;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateClaimRequest {

    @NotNull(message = "Claim ID must not be null")
    private Long claimId;

    private LocalDate incidentDate;

    private String description;

    private String status;

    private String documentUrl;
}
