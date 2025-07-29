package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.IAgentController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.user.IAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentControllerImpl implements IAgentController {
    private final IAgentService agentService;

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PostMapping("/offers/update-status")
    public ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(@Valid @RequestBody OfferUpdateRequest request) {
        OfferDto updated = agentService.updateOfferStatus(request);
        return ResponseEntity.ok(GeneralResponse.success("Offer status updated", updated));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/customers")
    public ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers() {
        List<CustomerDto> customers = agentService.getAllCustomers();
        return ResponseEntity.ok(GeneralResponse.success("Customer list", customers));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/customers/{customerId}")
    public ResponseEntity<GeneralResponse<CustomerDto>> updateCustomer(@PathVariable UUID customerId, @Valid @RequestBody UpdateIndividualCustomerRequest request) {
        CustomerDto updated = agentService.updateCustomer(customerId, request);
        return ResponseEntity.ok(GeneralResponse.success("Customer updated", updated));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/policies/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(@PathVariable UUID agentId) {
        List<PolicyDto> policies = agentService.getMyPolicies(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Agent's policies", policies));
    }
} 