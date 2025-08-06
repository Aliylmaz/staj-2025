package com.ada.insurance_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgentStatsDto {
    private String agentName;
    private String agentNumber;
    private long totalPolicies;
    private long totalClaims;
    private long totalPayments;
    private double totalPremium;
}
