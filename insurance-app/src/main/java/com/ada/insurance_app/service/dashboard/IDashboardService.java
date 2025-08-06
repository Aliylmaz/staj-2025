package com.ada.insurance_app.service.dashboard;

import com.ada.insurance_app.dto.AgentStatsDto;

import java.util.List;

public interface IDashboardService {
    long getTotalPolicyCount();
    long getTotalUserInSystem();
    long getTotalClaimCount();
    long getTotalPaymentCount();
    long getTotalOfferCount();
    double getTotalPremiumSum();
    List<AgentStatsDto> getAgentStatistics();


} 