package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;

public interface IAgentController {
    ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(OfferUpdateRequest request);
    ResponseEntity<GeneralResponse<CustomerDto>> updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request);

    ResponseEntity<GeneralResponse<List<OfferDto>>> getAllOffers();
    
    // Offer approval endpoints
    ResponseEntity<GeneralResponse<OfferDto>> approveOffer(Long offerId, UUID agentId);
    ResponseEntity<GeneralResponse<OfferDto>> rejectOffer(Long offerId, UUID agentId, String reason);
    
    // New endpoints for real agent operations
    ResponseEntity<GeneralResponse<AgentDto>> getCurrentAgent();
    ResponseEntity<GeneralResponse<AgentDto>> getAgentProfile(UUID agentId);
    ResponseEntity<GeneralResponse<AgentDto>> updateAgentProfile(UUID agentId, AgentDto agentDto);
    
    // Agent Statistics
    ResponseEntity<GeneralResponse<AgentStatsDto>> getMyStatistics();
    ResponseEntity<GeneralResponse<Long>> getMyCustomersCount();
    ResponseEntity<GeneralResponse<Long>> getMyActivePoliciesCount();
    ResponseEntity<GeneralResponse<Long>> getMyPendingClaimsCount();
    
    // Customer Management (through offers/policies)
    ResponseEntity<GeneralResponse<List<CustomerDto>>> getMyCustomers();
    
    // Policy Management
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyActivePolicies();
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyExpiredPolicies();
    ResponseEntity<GeneralResponse<PolicyDto>> assignPolicyToAgent(Long policyId, UUID agentId);
    

} 