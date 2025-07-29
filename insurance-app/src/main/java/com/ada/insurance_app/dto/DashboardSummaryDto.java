package com.ada.insurance_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardSummaryDto {
    private long totalPolicies;
    private long totalCustomers;
    private long totalClaims;
    private long totalPayments;
    private long totalOffers;
    private double totalPremium;
}
