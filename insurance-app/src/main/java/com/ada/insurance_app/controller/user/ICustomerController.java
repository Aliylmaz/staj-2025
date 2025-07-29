package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface ICustomerController {
    
    @PostMapping("/individual/create")
    ResponseEntity<GeneralResponse<CustomerDto>> createIndividualCustomer(@RequestBody AddIndividualCustomerRequest request);
    
    @PostMapping("/corporate/create")
    ResponseEntity<GeneralResponse<CustomerDto>> createCorporateCustomer(@RequestBody AddCorporateCustomerRequest request);
    
    @PutMapping("/individual/{customerId}")
    ResponseEntity<GeneralResponse<CustomerDto>> updateIndividualCustomer(@PathVariable UUID customerId, @RequestBody UpdateIndividualCustomerRequest request);
    
    @PutMapping("/corporate/{customerId}")
    ResponseEntity<GeneralResponse<CustomerDto>> updateCorporateCustomer(@PathVariable UUID customerId, @RequestBody UpdateCorporateCustomerRequest request);
    
    @GetMapping("/{customerId}")
    ResponseEntity<GeneralResponse<CustomerDto>> getCustomer(@PathVariable UUID customerId);
    
    @GetMapping("/all")
    ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers();
    
    @DeleteMapping("/{customerId}")
    ResponseEntity<GeneralResponse<Void>> deleteCustomer(@PathVariable UUID customerId);
}
