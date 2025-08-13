package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ICustomerController {

    // ----------- Customer İşlemleri -----------
    ResponseEntity<GeneralResponse<CustomerDto>> updateIndividualCustomer(UUID customerId, UpdateIndividualCustomerRequest request);
    ResponseEntity<GeneralResponse<CustomerDto>> updateCorporateCustomer(UUID customerId, UpdateCorporateCustomerRequest request);
    ResponseEntity<GeneralResponse<CustomerDto>> getCustomer(UUID customerId);
    ResponseEntity<GeneralResponse<CustomerDto>> getCurrentCustomer();
    ResponseEntity<GeneralResponse<Void>> deleteCustomer(UUID customerId);
    ResponseEntity<GeneralResponse<CustomerDashboardDto>> getCustomerDashboard(UUID customerId);


    // ----------- Policy İşlemleri -----------
    ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(UUID customerId);
    ResponseEntity<GeneralResponse<PolicyDto>> getPolicyById(Long policyId, UUID customerId);

    // ----------- Document İşlemleri -----------
    ResponseEntity<GeneralResponse<List<DocumentDto>>> getMyDocuments(UUID customerId);
    ResponseEntity<GeneralResponse<DocumentDto>> getDocumentById(Long documentId, UUID customerId);
    ResponseEntity<GeneralResponse<DocumentDto>> uploadDocument(MultipartFile file, UUID customerId, Long policyId, String claimId, String documentType, String description);

    // ----------- Claim İşlemleri -----------
    ResponseEntity<GeneralResponse<List<ClaimDto>>> getMyClaims(UUID customerId);
    ResponseEntity<GeneralResponse<ClaimDto>> getClaimById(UUID claimId, UUID customerId);
    ResponseEntity<GeneralResponse<ClaimDto>> createClaim(CreateClaimRequest request, UUID customerId);

    // ----------- Offer İşlemleri -----------
    ResponseEntity<GeneralResponse<OfferDto>> requestOffer(CreateOfferRequest request, UUID customerId);
    ResponseEntity<GeneralResponse<List<OfferDto>>> getMyOffers(UUID customerId);
    ResponseEntity<GeneralResponse<OfferDto>> getOfferById(Long offerId, UUID customerId);
    ResponseEntity<GeneralResponse<PolicyDto>> acceptOfferAndCreatePolicy(Long offerId, UUID customerId);

    // ----------- Payment İşlemleri -----------
    ResponseEntity<GeneralResponse<List<PaymentDto>>> getMyPayments(UUID customerId);
    ResponseEntity<GeneralResponse<PaymentDto>> getPaymentById(UUID paymentId, UUID customerId);
    ResponseEntity<GeneralResponse<PaymentDto>> makePayment(Long policyId, CreatePaymentRequest request, UUID customerId);

    // ----------- Agent İşlemleri -----------
    ResponseEntity<GeneralResponse<List<AgentDto>>> getAllAgents(UUID customerId);
}
