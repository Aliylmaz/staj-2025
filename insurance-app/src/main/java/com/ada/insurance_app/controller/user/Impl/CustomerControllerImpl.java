package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.ICustomerController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.request.claim.CreateClaimRequest;

import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.service.user.ICustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.CrossOrigin;

@Slf4j
@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerControllerImpl implements ICustomerController {

    private final ICustomerService customerService;

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{customerId}/individual")
    public ResponseEntity<GeneralResponse<CustomerDto>> updateIndividualCustomer(@PathVariable UUID customerId, @RequestBody UpdateIndividualCustomerRequest request) {
        try {
            log.info("Updating individual customer: {}", customerId);
            CustomerDto customer = customerService.updateIndividualCustomer(customerId, request);

            return ResponseEntity.ok(GeneralResponse.success("Individual customer updated successfully", customer));
        } catch (Exception e) {
            log.error("Error updating individual customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to update individual customer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{customerId}/corporate")
    public ResponseEntity<GeneralResponse<CustomerDto>> updateCorporateCustomer(@PathVariable UUID customerId, @RequestBody UpdateCorporateCustomerRequest request) {
        try {
            log.info("Updating corporate customer: {}", customerId);
            CustomerDto customer = customerService.updateCorporateCustomer(customerId, request);

            return ResponseEntity.ok(GeneralResponse.success("Corporate customer updated successfully", customer));

        } catch (Exception e) {
            log.error("Error updating corporate customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to update corporate customer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/get")
    public ResponseEntity<GeneralResponse<CustomerDto>> getCustomer(@PathVariable UUID customerId) {
        try {
            log.info("Getting customer: {}", customerId);
            CustomerDto customer = customerService.getCustomerById(customerId);

                return ResponseEntity.ok(GeneralResponse.success("Customer retrieved successfully", customer));


        } catch (Exception e) {
            log.error("Error getting customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get customer: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/current")
    public ResponseEntity<GeneralResponse<CustomerDto>> getCurrentCustomer() {
        try {
            log.info("Getting current customer");
            CustomerDto customer = customerService.getCurrentCustomer();

            return ResponseEntity.ok(GeneralResponse.success("Current customer retrieved successfully", customer));

        } catch (Exception e) {
            log.error("Error getting current customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get current customer: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }


     @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping("/{customerId}/delete")
    public ResponseEntity<GeneralResponse<Void>> deleteCustomer(@PathVariable UUID customerId) {
     try {
         log.info("Deleting customer: {}", customerId);
         customerService.deleteCustomer(customerId);
         return ResponseEntity.ok(GeneralResponse.success("Customer deleted successfully", null));
     } catch (Exception e) {
         log.error("Error deleting customer: {}", e.getMessage());
         return ResponseEntity.badRequest()
                 .body(GeneralResponse.error("Failed to delete customer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
     }
 }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/dashboard")
    public ResponseEntity<GeneralResponse<CustomerDashboardDto>> getCustomerDashboard(@PathVariable UUID customerId) {
        try {
            log.info("Getting dashboard for customer: {}", customerId);
            CustomerDashboardDto dashboard = customerService.getCustomerDashboard(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Dashboard retrieved successfully", dashboard));
        } catch (Exception e) {
            log.error("Error getting customer dashboard: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get customer dashboard: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/policies")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(@PathVariable UUID customerId) {
        try {
            log.info("Getting policies for customer: {}", customerId);
            List<PolicyDto> policies = customerService.getMyPolicies(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Policies retrieved successfully", policies));
        } catch (Exception e) {
            log.error("Error getting policies: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get policies: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/documents")
    public ResponseEntity<GeneralResponse<List<DocumentDto>>> getMyDocuments(@PathVariable UUID customerId) {
        try {
            log.info("Getting documents for customer: {}", customerId);
            List<DocumentDto> documents = customerService.getMyDocuments(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting documents: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get documents: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/claims")
    public ResponseEntity<GeneralResponse<List<ClaimDto>>> getMyClaims(@PathVariable UUID customerId) {
        try {
            log.info("Getting claims for customer: {}", customerId);
            List<ClaimDto> claims = customerService.getMyClaims(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Claims retrieved successfully", claims));
        } catch (Exception e) {
            log.error("Error getting claims: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get claims: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/policies/{policyId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> getPolicyById(@PathVariable Long policyId, @PathVariable UUID customerId) {

        try {
            log.info("Getting policy by ID: {} for customer: {}", policyId, customerId);
            PolicyDto policy = customerService.getPolicyById(policyId, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Policy retrieved successfully", policy));
        } catch (Exception e) {
            log.error("Error getting policy by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get policy: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/documents/{documentId}")
    public ResponseEntity<GeneralResponse<DocumentDto>> getDocumentById(@PathVariable Long documentId, @PathVariable UUID customerId) {

        try {
            log.info("Getting document by ID: {} for customer: {}", documentId, customerId);
            DocumentDto document = customerService.getDocumentById(documentId, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Document retrieved successfully", document));
        } catch (Exception e) {
            log.error("Error getting document by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get document: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }


    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{customerId}/documents")
    public ResponseEntity<GeneralResponse<DocumentDto>> uploadDocument(@RequestParam("file") MultipartFile file, @PathVariable UUID customerId) {
        try {
            log.info("Uploading document for customer: {}", customerId);
            DocumentDto document = customerService.uploadDocument(file, customerId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Document uploaded successfully", document));
        } catch (Exception e) {
            log.error("Error uploading document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to upload document: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/claims/{claimId}")
    public ResponseEntity<GeneralResponse<ClaimDto>> getClaimById(@PathVariable UUID claimId, @PathVariable UUID customerId) {
        try {
            log.info("Getting claim by ID: {} for customer: {}", claimId, customerId);
            ClaimDto claim = customerService.getClaimById(claimId, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Claim retrieved successfully", claim));
        } catch (Exception e) {
            log.error("Error getting claim by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get claim: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{customerId}/create-claim")
    public ResponseEntity<GeneralResponse<ClaimDto>> createClaim(@RequestBody  CreateClaimRequest request,@PathVariable UUID customerId) {
        try {
            log.info("Creating claim for customer: {}", customerId);
            ClaimDto claim = customerService.createClaim(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Claim created successfully", claim));
        } catch (Exception e) {
            log.error("Error creating claim: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to create claim: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{customerId}/create-offer")
    public ResponseEntity<GeneralResponse<OfferDto>> requestOffer(@RequestBody CreateOfferRequest request, @PathVariable UUID customerId) {
        try {
            log.info("Requesting offer for customer: {}", customerId);
            OfferDto offer = customerService.requestOffer(request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Offer requested successfully", offer));
        } catch (Exception e) {
            log.error("Error requesting offer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to request offer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/get-offers")
    public ResponseEntity<GeneralResponse<List<OfferDto>>> getMyOffers(@PathVariable UUID customerId) {
        try {
            log.info("Getting offers for customer: {}", customerId);
            List<OfferDto> offers = customerService.getMyOffers(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Offers retrieved successfully", offers));
        } catch (Exception e) {
            log.error("Error getting offers: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offers: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/offers/{offerId}")
    public ResponseEntity<GeneralResponse<OfferDto>> getOfferById(@PathVariable Long offerId, @PathVariable UUID customerId) {
        try {
            log.info("Getting offer by ID: {} for customer: {}", offerId, customerId);
            OfferDto offer = customerService.getOfferById(offerId, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Offer retrieved successfully", offer));
        } catch (Exception e) {
            log.error("Error getting offer by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offer: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{customerId}/offers/{offerId}/accept")
    public ResponseEntity<GeneralResponse<PolicyDto>> acceptOfferAndCreatePolicy(@PathVariable Long offerId, @PathVariable UUID customerId) {
        try {
            log.info("Accepting offer and creating policy for offer ID: {} and customer ID: {}", offerId, customerId);
            PolicyDto policy = customerService.acceptOfferAndCreatePolicy(offerId, customerId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Policy created successfully from offer", policy));
        } catch (Exception e) {
            log.error("Error accepting offer and creating policy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to create policy from offer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/payments")
    public ResponseEntity<GeneralResponse<List<PaymentDto>>> getMyPayments(@PathVariable UUID customerId) {
        try {
            log.info("Getting payments for customer: {}", customerId);
            List<PaymentDto> payments = customerService.getMyPayments(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Payments retrieved successfully", payments));
        } catch (Exception e) {
            log.error("Error getting payments: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get payments: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/agents")
    public ResponseEntity<GeneralResponse<List<AgentDto>>> getAllAgents(@PathVariable UUID customerId) {
        try {
            log.info("Getting all agents for customer: {}", customerId);
            List<AgentDto> agents = customerService.getAllAgents();
            return ResponseEntity.ok(GeneralResponse.success("Agents retrieved successfully", agents));
        } catch (Exception e) {
            log.error("Error getting agents: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get agents: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{customerId}/payments/{paymentId}")
    public ResponseEntity<GeneralResponse<PaymentDto>> getPaymentById(@PathVariable UUID paymentId, @PathVariable UUID customerId) {
        try {
            log.info("Getting payment by ID: {} for customer: {}", paymentId, customerId);
            PaymentDto payment = customerService.getPaymentById(paymentId, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("Error getting payment by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get payment: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{customerId}/policies/{policyId}/make-payment")
    public ResponseEntity<GeneralResponse<PaymentDto>> makePayment(@PathVariable Long policyId, @RequestBody CreatePaymentRequest request, @PathVariable UUID customerId) {

        try {
            log.info("Making payment for policy ID: {} and customer ID: {}", policyId, customerId);
            PaymentDto payment = customerService.makePayment(policyId, request, customerId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Payment made successfully", payment));
        } catch (Exception e) {
            log.error("Error making payment: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to make payment: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }

    }


}
