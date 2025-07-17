package com.ada.insurance_app.request.offer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateOfferRequest {

    @NotNull(message = "Customer ID must not be null")
    private Long customerId;

    @NotNull(message = "Vehicle ID must not be null")
    private String vehicleId; // UUID string (Vehicle entity uses UUID)

    @NotNull(message = "Start date must not be null")
    private LocalDate startDate;

    @NotNull(message = "End date must not be null")
    private LocalDate endDate;

    @NotNull(message = "Premium amount must not be null")
    private BigDecimal premium;
}
