package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.ICustomerController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.CustomerDto;
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
 }
