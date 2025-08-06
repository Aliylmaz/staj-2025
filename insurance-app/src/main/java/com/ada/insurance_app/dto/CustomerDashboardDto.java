package com.ada.insurance_app.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerDashboardDto {

    private int totalPolicies;
    private int totalClaims;
    private int totalPayments;
    private BigDecimal totalPremium;
}
