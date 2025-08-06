package com.ada.insurance_app.controller.policy.Impl;

import com.ada.insurance_app.controller.policy.IPolicyController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.request.policy.CreatePolicyRequest;
import com.ada.insurance_app.request.policy.UpdatePolicyRequest;
import com.ada.insurance_app.request.policy.CancelPolicyRequest;
import com.ada.insurance_app.service.policy.IPolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyControllerImpl implements IPolicyController {

    private final IPolicyService policyService;

    @Override
    @PostMapping("/create")
    public ResponseEntity<GeneralResponse<PolicyDto>> createPolicy(@RequestBody CreatePolicyRequest request) {
        try {
            log.info("Creating policy for customer: {}", request.getCustomerId());
            PolicyDto policy = policyService.createPolicyFromRequest(request);

            return ResponseEntity.ok(GeneralResponse.success("Policy created successfully", policy));
        } catch (Exception e) {
            log.error("Error creating policy: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to create policy: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PutMapping("/{policyId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> updatePolicy(@PathVariable Long policyId, @RequestBody UpdatePolicyRequest request) {
        try {
            log.info("Updating policy: {}", policyId);
            PolicyDto policy = policyService.updatePolicyFromRequest(policyId, request);

            return ResponseEntity.ok(GeneralResponse.success("Policy updated successfully", policy));
        } catch (Exception e) {
            log.error("Error updating policy: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to update policy: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PostMapping("/{policyId}/cancel")
    public ResponseEntity<GeneralResponse<Void>> cancelPolicy(@PathVariable Long policyId, @RequestBody CancelPolicyRequest request) {
        try {
            log.info("Cancelling policy: {}", policyId);
            policyService.cancelPolicyFromRequest(policyId, request);

            return ResponseEntity.ok(GeneralResponse.success("Policy cancelled successfully", null));
        } catch (Exception e) {
            log.error("Error cancelling policy: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to cancel policy: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/{policyId}")
    public ResponseEntity<GeneralResponse<PolicyDto>> getPolicy(@PathVariable Long policyId) {
        try {
            log.info("Getting policy: {}", policyId);
            PolicyDto policy = policyService.getPolicyById(policyId);

            return ResponseEntity.ok(GeneralResponse.success("Policy retrieved successfully", policy));
        } catch (Exception e) {
            log.error("Error getting policy: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get policy: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesByAgent(@PathVariable UUID agentId) {
        try {
            log.info("Getting policies for agent: {}", agentId);
            List<PolicyDto> policies = policyService.getPoliciesByAgent(agentId);

            return ResponseEntity.ok(GeneralResponse.success("Policies retrieved successfully", policies));
        } catch (Exception e) {
            log.error("Error getting policies for agent: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get policies: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getPoliciesByCustomer(@PathVariable UUID customerId) {
        try {
            log.info("Getting policies for customer: {}", customerId);
            List<PolicyDto> policies = policyService.getPoliciesByCustomer(customerId);


            return ResponseEntity.ok(GeneralResponse.success("Policies retrieved successfully", policies));


        } catch (Exception e) {
            log.error("Error getting policies for customer: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get policies: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/all")
    public ResponseEntity<GeneralResponse<List<PolicyDto>>> getAllPolicies() {
        try {
            log.info("Getting all policies");
            List<PolicyDto> policies = policyService.getAllPolicies();

            return ResponseEntity.ok(GeneralResponse.success("All policies retrieved successfully", policies));
        } catch (Exception e) {
            log.error("Error getting all policies: {}", e.getMessage());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get all policies: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @DeleteMapping("/{policyId}")
    public ResponseEntity<GeneralResponse<Void>> deletePolicy(@PathVariable Long policyId) {
        try {
            log.info("Deleting policy: {}", policyId);
            policyService.deletePolicy(policyId);

            GeneralResponse<Void> response = GeneralResponse.<Void>builder()
                    .success(true)
                    .message("Policy deleted successfully")
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting policy: {}", e.getMessage());

            GeneralResponse<Void> response = GeneralResponse.<Void>builder()
                    .success(false)
                    .message("Failed to delete policy: " + e.getMessage())
                    .build();

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
