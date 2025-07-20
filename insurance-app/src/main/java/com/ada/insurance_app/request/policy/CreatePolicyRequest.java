package com.ada.insurance_app.request.policy;



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

    @NotNull(message = "Vehicle ID must not be null")
    private UUID vehicleId;

    @NotNull(message = "Policy start date is required")
    private LocalDate startDate;

    @NotNull(message = "Policy end date is required")
    private LocalDate endDate;

    private Set<UUID> coverageIds; // Optional
}
