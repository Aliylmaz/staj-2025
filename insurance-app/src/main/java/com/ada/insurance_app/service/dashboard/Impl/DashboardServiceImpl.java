package com.ada.insurance_app.service.dashboard.Impl;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.repository.*;
import com.ada.insurance_app.repository.IAgentRepository;
import com.ada.insurance_app.repository.auth.User.IUserRepository;
import com.ada.insurance_app.service.dashboard.IDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements IDashboardService {
    private final IPolicyRepository policyRepository;
    private final IClaimRepository claimRepository;
    private final IPaymentRepository paymentRepository;
    private final IOfferRepository offerRepository;
    private final IUserRepository userRepository;
    private final IAgentRepository agentRepository;

    @Override
    public long getTotalPolicyCount() {
        return policyRepository.count();
    }
    @Override
    public long getTotalUserInSystem() {
        return userRepository.count();
    }
    @Override
    public long getTotalClaimCount() {
        return claimRepository.count();
    }
    @Override
    public long getTotalPaymentCount() {
        return paymentRepository.count();
    }
    @Override
    public long getTotalOfferCount() {
        return offerRepository.count();
    }
    @Override
    public double getTotalPremiumSum() {
        return policyRepository.sumTotalPremium();
    }

    @Override
    public List<AgentStatsDto> getAgentStatistics() {
        List<Agent> agents = agentRepository.findAllByUserRole(Role.AGENT);

        List<AgentStatsDto> stats = new ArrayList<>();

        for (Agent  agent : agents) {
            String agentNumber = agent.getAgentNumber();

            long policyCount = policyRepository.countPoliciesByAgent_AgentNumber(agentNumber);
            long claimCount = claimRepository.countByPolicy_Agent_AgentNumber(agentNumber);
            long paymentCount = paymentRepository.countByPolicy_Agent_AgentNumber(agentNumber);
            double totalPremium = policyRepository.sumTotalPremiumByAgentNumber(agentNumber);

            AgentStatsDto agentStats = new AgentStatsDto();
            agentStats.setAgentName(agent.getName());
            agentStats.setAgentNumber(agent.getAgentNumber());
            agentStats.setTotalPolicies(policyCount);
            agentStats.setTotalClaims(claimCount);
            agentStats.setTotalPayments(paymentCount);
            agentStats.setTotalPremium(totalPremium);
            // Success rate: Policies that have payments / Total policies * 100
            double successRate = policyCount > 0 ? (double) paymentCount / policyCount * 100 : 0.0;
            agentStats.setSuccessRate(successRate);

            stats.add(agentStats);
        }
        return stats;
    }

    @Override
    public AgentStatsDto getAgentStatisticsById(UUID agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found with ID: " + agentId));

        String agentNumber = agent.getAgentNumber();
        log.info("=== getAgentStatisticsById Debug ===");
        log.info("Agent ID: {}, Agent Number: {}, Agent Name: {}", agentId, agentNumber, agent.getName());

        long policyCount = policyRepository.countPoliciesByAgent_AgentNumber(agentNumber);
        long claimCount = claimRepository.countByPolicy_Agent_AgentNumber(agentNumber);
        long paymentCount = paymentRepository.countByPolicy_Agent_AgentNumber(agentNumber);
        double totalPremium = policyRepository.sumTotalPremiumByAgentNumber(agentNumber);

        log.info("Policy Count: {}, Claim Count: {}, Payment Count: {}, Total Premium: {}", 
                policyCount, claimCount, paymentCount, totalPremium);

        AgentStatsDto agentStats = new AgentStatsDto();
        agentStats.setAgentName(agent.getName());
        agentStats.setAgentNumber(agent.getAgentNumber());
        agentStats.setTotalPolicies(policyCount);
        agentStats.setTotalClaims(claimCount);
        agentStats.setTotalPayments(paymentCount);
        agentStats.setTotalPremium(totalPremium);
        // Success rate: Policies that have payments / Total policies * 100
        double successRate = policyCount > 0 ? (double) paymentCount / policyCount * 100 : 0.0;
        agentStats.setSuccessRate(successRate);

        log.info("Success Rate: {}%", agentStats.getSuccessRate());
        log.info("=== End getAgentStatisticsById Debug ===");

        return agentStats;
    }

} 