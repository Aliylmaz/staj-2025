package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.policy.UpdatePolicyRequest;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.UUID;

public interface IAgentController {
    ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(OfferUpdateRequest request);
    ResponseEntity<GeneralResponse<CustomerDto>> updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request);

    ResponseEntity<GeneralResponse<List<OfferDto>>> getOfferByAgentId(UUID agentId);
    
    // Offer detail endpoint
    ResponseEntity<GeneralResponse<OfferDto>> getOfferById(Long offerId);
    
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
    
    // Policy Details
    ResponseEntity<GeneralResponse<PolicyDto>> getPolicyById(Long policyId);
    ResponseEntity<GeneralResponse<List<CoverageDto>>> getPolicyCoverages(Long policyId);
    ResponseEntity<GeneralResponse<PolicyDto>> updatePolicyStatus(Long policyId, PolicyStatus status);

    // Payment Management
    ResponseEntity<GeneralResponse<List<PaymentDto>>> getPaymentsByAgentId(UUID agentId);

} 