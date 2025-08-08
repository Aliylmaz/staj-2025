package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.AgentDto;
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
    ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers();
    ResponseEntity<GeneralResponse<CustomerDto>> updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request);
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(UUID agentId);
    ResponseEntity<GeneralResponse<List<OfferDto>>> getAllOffers();
    
    // New endpoints for real agent operations
    ResponseEntity<GeneralResponse<AgentDto>> getAgentProfile(UUID agentId);
    ResponseEntity<GeneralResponse<AgentDto>> updateAgentProfile(UUID agentId, AgentDto agentDto);
    
    // Agent Statistics
    //ResponseEntity<GeneralResponse<Long>> getMyCustomersCount(UUID agentId);
    ResponseEntity<GeneralResponse<Long>> getMyActivePoliciesCount(UUID agentId);
    ResponseEntity<GeneralResponse<Long>> getMyPendingClaimsCount(UUID agentId);

    
    // Customer Management
    ResponseEntity<GeneralResponse<List<CustomerDto>>> getMyCustomers(UUID agentId);
    ResponseEntity<GeneralResponse<CustomerDto>> assignCustomerToAgent(UUID customerId, UUID agentId);
    ResponseEntity<GeneralResponse<CustomerDto>> removeCustomerFromAgent(UUID customerId, UUID agentId);
    
    // Policy Management
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyActivePolicies(UUID agentId);
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyExpiredPolicies(UUID agentId);
    ResponseEntity<GeneralResponse<PolicyDto>> assignPolicyToAgent(Long policyId, UUID agentId);
    
    // Commission Tracking
    ResponseEntity<GeneralResponse<Double>> getCommissionForPolicy(Long policyId, UUID agentId);
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesForCommissionCalculation(UUID agentId, String month, String year);
} 