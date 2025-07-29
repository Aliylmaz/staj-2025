package com.ada.insurance_app.service.user;

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
} 