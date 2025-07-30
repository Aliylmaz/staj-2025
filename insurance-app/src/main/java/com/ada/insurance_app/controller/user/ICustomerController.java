package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface ICustomerController {
    

    ResponseEntity<GeneralResponse<CustomerDto>> createIndividualCustomer( AddIndividualCustomerRequest request);
    

    ResponseEntity<GeneralResponse<CustomerDto>> createCorporateCustomer( AddCorporateCustomerRequest request);
    

    ResponseEntity<GeneralResponse<CustomerDto>> updateIndividualCustomer( UUID customerId,  UpdateIndividualCustomerRequest request);
    

    ResponseEntity<GeneralResponse<CustomerDto>> updateCorporateCustomer( UUID customerId,  UpdateCorporateCustomerRequest request);
    

    ResponseEntity<GeneralResponse<CustomerDto>> getCustomer( UUID customerId);
    

    ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers();

    ResponseEntity<GeneralResponse<Void>> deleteCustomer( UUID customerId);

    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(UUID customerId);

    ResponseEntity<GeneralResponse<List<DocumentDto>>> getMyDocuments(UUID customerId);

    ResponseEntity<GeneralResponse<List<ClaimDto>>> getMyClaims(UUID customerId);

    ResponseEntity<GeneralResponse<PolicyDto>> getPolicyById( Long policyId, UUID customerId);

    ResponseEntity<GeneralResponse<DocumentDto>> getDocumentById(Long documentId, UUID customerId);

    ResponseEntity<GeneralResponse<ClaimDto>> getClaimById(UUID claimId, UUID customerId);

    ResponseEntity<GeneralResponse<PolicyDto>> createPolicy(PolicyDto policyDto, UUID customerId);
}
