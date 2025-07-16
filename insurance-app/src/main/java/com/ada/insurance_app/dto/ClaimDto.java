package com.ada.insurance_app.dto;

import com.ada.insurance_app.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

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


}
