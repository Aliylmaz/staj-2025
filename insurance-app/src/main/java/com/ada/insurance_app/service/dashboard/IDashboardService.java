package com.ada.insurance_app.service.dashboard;

import com.ada.insurance_app.dto.AgentStatsDto;

import java.util.List;
import java.util.UUID;

public interface IDashboardService {
    long getTotalPolicyCount();
    long getTotalUserInSystem();
    long getTotalClaimCount();
    long getTotalPaymentCount();
    long getTotalOfferCount();
    double getTotalPremiumSum();
    List<AgentStatsDto> getAgentStatistics();

    //get agent statistics by agent id
    AgentStatsDto getAgentStatisticsById(UUID agentId);


} 