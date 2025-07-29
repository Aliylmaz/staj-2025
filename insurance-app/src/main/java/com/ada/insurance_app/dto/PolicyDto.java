package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.core.enums.PolicyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PolicyDto {
    private Long id;
    private String policyNumber;
    private PolicyStatus status;

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal premium;

    private UUID customerId;
    private String customerName;

    private VehicleDto vehicleDto;


    private Set<CoverageDto> coverages;

    private PaymentDto payment;

    private InsuranceType insuranceType;
    private HealthInsuranceDetailDto healthInsuranceDetail;
    private HomeInsuranceDetailDto homeInsuranceDetail;

    private UUID agentId;
    private AgentDto agentDto;
}
