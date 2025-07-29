package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;

import java.util.List;
import java.util.UUID;

public interface ICustomerService {

     List<PolicyDto> getMyPolicies(UUID customerId);
    List<DocumentDto> getMyDocuments(UUID customerId);
    List<ClaimDto> getMyClaims(UUID customerId);
    PolicyDto getPolicyById(Long policyId, UUID customerId);
    DocumentDto getDocumentById(Long documentId, UUID customerId);
    ClaimDto getClaimById(UUID claimId, UUID customerId);

    PolicyDto createPolicy(PolicyDto policyDto, UUID customerId);
    
    // Request sınıflarını kullanan yeni metodlar
    CustomerDto createIndividualCustomer(AddIndividualCustomerRequest request);
    CustomerDto createCorporateCustomer(AddCorporateCustomerRequest request);
    CustomerDto updateIndividualCustomer(UUID customerId, UpdateIndividualCustomerRequest request);
    CustomerDto updateCorporateCustomer(UUID customerId, UpdateCorporateCustomerRequest request);
    CustomerDto getCustomerById(UUID customerId);
    List<CustomerDto> getAllCustomers();
    void deleteCustomer(UUID customerId);

}
