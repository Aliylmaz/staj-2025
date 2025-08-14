package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.dto.CustomerDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDto {
    private UUID id;
    private String claimNumber;
    private ClaimStatus status;
    private LocalDate incidentDate;
    private String description;
    private BigDecimal estimatedAmount;
    private BigDecimal approvedAmount;
    private String rejectionReason;
    private boolean notificationsEnabled;
    private Long policyId;
    private UUID agentId;
    private String agentName;
    
    // Policy information
    private PolicyDto policy;
    
    // Customer information
    private CustomerDto customer;
}
