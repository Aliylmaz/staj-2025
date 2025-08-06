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
    ResponseEntity<GeneralResponse<List<AgentDto>>> getAllAgents();
} 