package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.ICustomerController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.user.ICustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/project/customer")
@RequiredArgsConstructor
public class CustomerControllerImpl implements ICustomerController {

    private final ICustomerService customerService;

    @Override
    @PostMapping("/individual/create")
    public ResponseEntity<GeneralResponse<CustomerDto>> createIndividualCustomer(@RequestBody AddIndividualCustomerRequest request) {
        try {
            log.info("Creating individual customer with national ID: {}", request.getNationalId());
            CustomerDto customer = customerService.createIndividualCustomer(request);

           return ResponseEntity.ok(GeneralResponse.success("Individual customer created successfully", customer));
        } catch (Exception e) {
            log.error("Error creating individual customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to create individual customer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PostMapping("/corporate/create")
    public ResponseEntity<GeneralResponse<CustomerDto>> createCorporateCustomer(@RequestBody AddCorporateCustomerRequest request) {
        try {
            log.info("Creating corporate customer with tax number: {}", request.getTaxNumber());
            CustomerDto customer = customerService.createCorporateCustomer(request);

            return ResponseEntity.ok(GeneralResponse.success("Corporate customer created successfully", customer));
        } catch (Exception e) {
            log.error("Error creating corporate customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to create corporate customer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PutMapping("/individual/{customerId}")
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
    @PutMapping("/corporate/{customerId}")
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
    @GetMapping("/{customerId}")
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
    @GetMapping("/all")
    public ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers() {
        try {
            log.info("Getting all customers");
            List<CustomerDto> customers = customerService.getAllCustomers();

            return ResponseEntity.ok(GeneralResponse.success( "All customers retrieved successfully", customers));


        } catch (Exception e) {
            log.error("Error getting all customers: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get all customers: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

 @Override
 @DeleteMapping("/{customerId}")
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
    @GetMapping("/policies/{customerId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(UUID customerId) {
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
    @GetMapping("/documents/{customerId}")
    public ResponseEntity<GeneralResponse<List<DocumentDto>>> getMyDocuments(UUID customerId) {
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
    @GetMapping("/claims/{customerId}")
    public ResponseEntity<GeneralResponse<List<ClaimDto>>> getMyClaims(UUID customerId) {
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
    @GetMapping("/policy/{policyId}/customer/{customerId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> getPolicyById(Long policyId, UUID customerId) {

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
    @GetMapping("/document/{documentId}/customer/{customerId}")
    public ResponseEntity<GeneralResponse<DocumentDto>> getDocumentById(Long documentId, UUID customerId) {

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
    @GetMapping("/claim/{claimId}/customer/{customerId}")
    public ResponseEntity<GeneralResponse<ClaimDto>> getClaimById(UUID claimId, UUID customerId) {
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
    @PostMapping("/policy/create/{customerId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> createPolicy(PolicyDto policyDto, UUID customerId) {
        try {
            log.info("Creating policy for customer: {}", customerId);
            PolicyDto createdPolicy = customerService.createPolicy(policyDto, customerId);
            return ResponseEntity.ok(GeneralResponse.success("Policy created successfully", createdPolicy));
        } catch (Exception e) {
            log.error("Error creating policy: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to create policy: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
