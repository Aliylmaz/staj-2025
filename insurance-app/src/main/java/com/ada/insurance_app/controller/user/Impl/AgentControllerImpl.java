package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.IAgentController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.user.IAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
@Slf4j
public class AgentControllerImpl implements IAgentController {
    private final IAgentService agentService;

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PostMapping("/offers/update-status")
    public ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(@Valid @RequestBody OfferUpdateRequest request) {
        log.info("Agent updating offer status: offerId={}, status={}", request.getOfferId(), request.getStatus());
        OfferDto updated = agentService.updateOfferStatus(request);
        return ResponseEntity.ok(GeneralResponse.success("Offer status updated", updated));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/customers")
    public ResponseEntity<GeneralResponse<List<CustomerDto>>> getAllCustomers() {
        log.info("Agent fetching all customers");
        List<CustomerDto> customers = agentService.getAllCustomers();
        return ResponseEntity.ok(GeneralResponse.success("Customer list", customers));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/customers/{customerId}")
    public ResponseEntity<GeneralResponse<CustomerDto>> updateCustomer(@PathVariable UUID customerId, @Valid @RequestBody UpdateIndividualCustomerRequest request) {
        log.info("Agent updating customer: customerId={}", customerId);
        CustomerDto updated = agentService.updateCustomer(customerId, request);
        return ResponseEntity.ok(GeneralResponse.success("Customer updated", updated));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/policies/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyPolicies(@PathVariable UUID agentId) {
        log.info("Agent fetching policies: agentId={}", agentId);
        List<PolicyDto> policies = agentService.getMyPolicies(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Agent's policies", policies));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/offers")
    public ResponseEntity<GeneralResponse<List<OfferDto>>> getAllOffers() {
        log.info("Agent fetching all offers");
        List<OfferDto> offers = agentService.getAllOffers();
        return ResponseEntity.ok(GeneralResponse.success("Offers list", offers));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/offers/{offerId}/approve")
    public ResponseEntity<GeneralResponse<OfferDto>> approveOffer(@PathVariable Long offerId, @RequestParam UUID agentId) {
        log.info("Agent {} approving offer: {}", agentId, offerId);
        OfferDto offer = agentService.approveOffer(offerId, agentId);
        return ResponseEntity.ok(GeneralResponse.success("Offer approved successfully", offer));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/offers/{offerId}/reject")
    public ResponseEntity<GeneralResponse<OfferDto>> rejectOffer(@PathVariable Long offerId, @RequestParam UUID agentId, @RequestParam String reason) {
        log.info("Agent {} rejecting offer: {} with reason: {}", agentId, offerId, reason);
        OfferDto offer = agentService.rejectOffer(offerId, agentId, reason);
        return ResponseEntity.ok(GeneralResponse.success("Offer rejected successfully", offer));
    }

    // New endpoints for real agent operations

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/current")
    public ResponseEntity<GeneralResponse<AgentDto>> getCurrentAgent() {
        log.info("Getting current agent");
        AgentDto currentAgent = agentService.getCurrentAgent();
        return ResponseEntity.ok(GeneralResponse.success("Current agent", currentAgent));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/profile/{agentId}")
    public ResponseEntity<GeneralResponse<AgentDto>> getAgentProfile(@PathVariable UUID agentId) {
        log.info("Agent fetching profile: agentId={}", agentId);
        AgentDto profile = agentService.getAgentProfile(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Agent profile", profile));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/profile/{agentId}")
    public ResponseEntity<GeneralResponse<AgentDto>> updateAgentProfile(@PathVariable UUID agentId, @Valid @RequestBody AgentDto agentDto) {
        log.info("Agent updating profile: agentId={}", agentId);
        AgentDto updated = agentService.updateAgentProfile(agentId, agentDto);
        return ResponseEntity.ok(GeneralResponse.success("Agent profile updated", updated));
    }

    // Agent Statistics

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/statistics")
    public ResponseEntity<GeneralResponse<AgentStatsDto>> getMyStatistics() {
        log.info("Agent fetching statistics");
        AgentStatsDto stats = agentService.getMyStatistics();
        return ResponseEntity.ok(GeneralResponse.success("Agent statistics", stats));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/statistics/customers-count/{agentId}")
    public ResponseEntity<GeneralResponse<Long>> getMyCustomersCount(@PathVariable UUID agentId) {
        log.info("Agent fetching customers count: agentId={}", agentId);
        Long count = agentService.getMyCustomersCount(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Customers count", count));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/statistics/active-policies-count/{agentId}")
    public ResponseEntity<GeneralResponse<Long>> getMyActivePoliciesCount(@PathVariable UUID agentId) {
        log.info("Agent fetching active policies count: agentId={}", agentId);
        Long count = agentService.getMyActivePoliciesCount(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Active policies count", count));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/statistics/pending-claims-count/{agentId}")
    public ResponseEntity<GeneralResponse<Long>> getMyPendingClaimsCount(@PathVariable UUID agentId) {
        log.info("Agent fetching pending claims count: agentId={}", agentId);
        Long count = agentService.getMyPendingClaimsCount(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Pending claims count", count));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/my-customers/{agentId}")
    public ResponseEntity<GeneralResponse<List<CustomerDto>>> getMyCustomers(@PathVariable UUID agentId) {
        log.info("Agent fetching my customers: agentId={}", agentId);
        List<CustomerDto> customers = agentService.getMyCustomers(agentId);
        return ResponseEntity.ok(GeneralResponse.success("My customers", customers));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PostMapping("/customers/{customerId}/assign/{agentId}")
    public ResponseEntity<GeneralResponse<CustomerDto>> assignCustomerToAgent(@PathVariable UUID customerId, @PathVariable UUID agentId) {
        log.info("Agent assigning customer: customerId={}, agentId={}", customerId, agentId);
        CustomerDto assigned = agentService.assignCustomerToAgent(customerId, agentId);
        return ResponseEntity.ok(GeneralResponse.success("Customer assigned to agent", assigned));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @DeleteMapping("/customers/{customerId}/remove/{agentId}")
    public ResponseEntity<GeneralResponse<CustomerDto>> removeCustomerFromAgent(@PathVariable UUID customerId, @PathVariable UUID agentId) {
        log.info("Agent removing customer: customerId={}, agentId={}", customerId, agentId);
        CustomerDto removed = agentService.removeCustomerFromAgent(customerId, agentId);
        return ResponseEntity.ok(GeneralResponse.success("Customer removed from agent", removed));
    }

    // Policy Management

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/active-policies/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyActivePolicies(@PathVariable UUID agentId) {
        log.info("Agent fetching active policies: agentId={}", agentId);
        List<PolicyDto> policies = agentService.getMyActivePolicies(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Active policies", policies));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/expired-policies/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getMyExpiredPolicies(@PathVariable UUID agentId) {
        log.info("Agent fetching expired policies: agentId={}", agentId);
        List<PolicyDto> policies = agentService.getMyExpiredPolicies(agentId);
        return ResponseEntity.ok(GeneralResponse.success("Expired policies", policies));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @PostMapping("/policies/{policyId}/assign/{agentId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> assignPolicyToAgent(@PathVariable Long policyId, @PathVariable UUID agentId) {
        log.info("Agent assigning policy: policyId={}, agentId={}", policyId, agentId);
        PolicyDto assigned = agentService.assignPolicyToAgent(policyId, agentId);
        return ResponseEntity.ok(GeneralResponse.success("Policy assigned to agent", assigned));
    }

    // Commission Tracking

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/commission/policy/{policyId}/{agentId}")
    public ResponseEntity<GeneralResponse<Double>> getCommissionForPolicy(@PathVariable Long policyId, @PathVariable UUID agentId) {
        log.info("Agent calculating commission: policyId={}, agentId={}", policyId, agentId);
        Double commission = agentService.getCommissionForPolicy(policyId, agentId);
        return ResponseEntity.ok(GeneralResponse.success("Commission for policy", commission));
    }

    @Override
    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/commission/policies/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesForCommissionCalculation(
            @PathVariable UUID agentId, 
            @RequestParam String month, 
            @RequestParam String year) {
        log.info("Agent fetching policies for commission: agentId={}, month={}, year={}", agentId, month, year);
        List<PolicyDto> policies = agentService.getPoliciesForCommissionCalculation(agentId, month, year);
        return ResponseEntity.ok(GeneralResponse.success("Policies for commission calculation", policies));
    }
} 