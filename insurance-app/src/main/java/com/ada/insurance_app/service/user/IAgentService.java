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
    CustomerDto updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request);

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
    Long getMyActivePoliciesCount();
    Long getMyPendingClaimsCount();

    
    // Customer Management (through offers/policies)
    List<CustomerDto> getMyCustomers();
    Long getMyCustomersCount();
    
    // Policy Management
    List<PolicyDto> getMyActivePolicies();
    List<PolicyDto> getMyExpiredPolicies();
    PolicyDto assignPolicyToAgent(Long policyId, UUID agentId); // Bu admin işlemi olduğu için agentId kalabilir
    

} 