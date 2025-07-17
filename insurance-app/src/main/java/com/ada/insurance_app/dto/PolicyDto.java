package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.PolicyStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDto {
    private Long id;
    private String policyNumber;
    private PolicyStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal premium;

    private CustomerDto customer;
    private VehicleDto vehicle;
    private Set<CoverageDto> coverages;

    private OfferDto offer;
    private PaymentDto payment;
}
