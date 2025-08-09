package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import java.util.List;
import java.util.UUID;

public interface IAgentService {
    OfferDto updateOfferStatus(OfferUpdateRequest request);
    List<CustomerDto> getAllCustomers();
    CustomerDto updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request);
    List<PolicyDto> getMyPolicies(UUID agentId);
    List<OfferDto> getAllOffers();
    
    // Offer approval methods
    OfferDto approveOffer(Long offerId, UUID agentId);
    OfferDto rejectOffer(Long offerId, UUID agentId, String reason);
    
    // New methods for real agent operations
    AgentDto getCurrentAgent();
    AgentDto getAgentProfile(UUID agentId);
    AgentDto updateAgentProfile(UUID agentId, AgentDto agentDto);
    
    // Agent Statistics
    AgentStatsDto getMyStatistics();
    Long getMyActivePoliciesCount(UUID agentId);
    Long getMyPendingClaimsCount(UUID agentId);

    
    // Customer Management
    List<CustomerDto> getMyCustomers(UUID agentId);
    CustomerDto assignCustomerToAgent(UUID customerId, UUID agentId);
    CustomerDto removeCustomerFromAgent(UUID customerId, UUID agentId);
    Long getMyCustomersCount(UUID agentId);
    
    // Policy Management
    List<PolicyDto> getMyActivePolicies(UUID agentId);
    List<PolicyDto> getMyExpiredPolicies(UUID agentId);
    PolicyDto assignPolicyToAgent(Long policyId, UUID agentId);
    
    // Commission Tracking
    Double getCommissionForPolicy(Long policyId, UUID agentId);
    List<PolicyDto> getPoliciesForCommissionCalculation(UUID agentId, String month, String year);
} 