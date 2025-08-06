package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface ICustomerService {
    List<PolicyDto> getMyPolicies(UUID customerId);
    List<DocumentDto> getMyDocuments(UUID customerId);
    List<ClaimDto> getMyClaims(UUID customerId);
    List<OfferDto> getMyOffers(UUID customerId);
    List<PaymentDto> getMyPayments(UUID customerId);

    OfferDto requestOffer(CreateOfferRequest request, UUID customerId);
    OfferDto getOfferById(Long offerId, UUID customerId);
    PolicyDto acceptOfferAndCreatePolicy(Long offerId, UUID customerId);

    ClaimDto createClaim(CreateClaimRequest request, UUID customerId);
    PaymentDto makePayment(Long policyId, CreatePaymentRequest request, UUID customerId);

    PolicyDto getPolicyById(Long policyId, UUID customerId);
    DocumentDto getDocumentById(Long documentId, UUID customerId);
    ClaimDto getClaimById(UUID claimId, UUID customerId);
    PaymentDto getPaymentById(UUID paymentId, UUID customerId);

    DocumentDto uploadDocument(MultipartFile file, UUID customerId);

    CustomerDto updateIndividualCustomer(UUID customerId, UpdateIndividualCustomerRequest request);
    CustomerDto updateCorporateCustomer(UUID customerId, UpdateCorporateCustomerRequest request);
    CustomerDto getCustomerById(UUID customerId);
    void deleteCustomer(UUID customerId);

    CustomerDashboardDto getCustomerDashboard(UUID customerId);
    CustomerDto getCurrentCustomer();


    // CustomerSummaryDto getCustomerSummary(UUID customerId);
}
