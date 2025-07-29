package com.ada.insurance_app.controller.policy.Impl;

import com.ada.insurance_app.controller.policy.IClaimController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.claim.UpdateClaimRequest;
import com.ada.insurance_app.service.policy.IClaimService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/project/claim")
@RequiredArgsConstructor
public class ClaimControllerImpl implements IClaimController {
    
    private final IClaimService claimService;
    
    @Override
    @PostMapping("/create")
    public ResponseEntity<GeneralResponse<ClaimDto>> createClaim(@RequestBody CreateClaimRequest request) {
        try {
            log.info("Creating claim for policy: {}", request.getPolicyId());
            ClaimDto claim = claimService.createClaimFromRequest(request);
            
            return ResponseEntity.ok(GeneralResponse.success("Claim created successfully", claim));
        } catch (Exception e) {
            log.error("Error creating claim: {}", e.getMessage());
            

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error("Failed to create claim: " + e.getMessage(), HttpStatus.BAD_REQUEST)
            );
        }
    }
    
    @Override
    @PutMapping("/{claimId}")
    public ResponseEntity<GeneralResponse<ClaimDto>> updateClaim(@PathVariable UUID claimId, @RequestBody UpdateClaimRequest request) {
        try {
            log.info("Updating claim: {}", claimId);
            ClaimDto claim = claimService.updateClaimFromRequest(claimId, request);
            
            return ResponseEntity.ok(GeneralResponse.success("Claim updated successfully", claim));
        } catch (Exception e) {
            log.error("Error updating claim: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error("Failed to update claim: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
    
    @Override
    @GetMapping("/{claimId}")
    public ResponseEntity<GeneralResponse<ClaimDto>> getClaim(@PathVariable UUID claimId) {
        try {
            log.info("Getting claim: {}", claimId);
            ClaimDto claim = claimService.getClaimById(claimId);
            
           return ResponseEntity.ok(GeneralResponse.success("Claim retrieved successfully", claim));
        } catch (Exception e) {
            log.error("Error getting claim: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error("Failed to get claim: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
    
    @Override
    @GetMapping("/policy/{policyId}")
    public ResponseEntity<GeneralResponse<List<ClaimDto>>> getClaimsByPolicy(@PathVariable Long policyId) {
        try {
            log.info("Getting claims for policy: {}", policyId);
            List<ClaimDto> claims = claimService.getClaimsByPolicy(policyId);
            
            return ResponseEntity.ok(GeneralResponse.success("Claims retrieved successfully", claims));
        } catch (Exception e) {
            log.error("Error getting claims for policy: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(GeneralResponse.error("Failed to get claims: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
    
    @Override
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<GeneralResponse<List<ClaimDto>>> getClaimsByCustomer(@PathVariable UUID customerId) {
        try {
            log.info("Getting claims for customer: {}", customerId);
            List<ClaimDto> claims = claimService.getClaimsByCustomer(customerId);
            
           return ResponseEntity.ok(GeneralResponse.success("Claims retrieved successfully", claims));
        } catch (Exception e) {
            log.error("Error getting claims for customer: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body
                    (GeneralResponse.error("Failed to get claims: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
    
    @Override
    @GetMapping("/all")
    public ResponseEntity<GeneralResponse<List<ClaimDto>>> getAllClaims() {
        try {
            log.info("Getting all claims");
            List<ClaimDto> claims = claimService.getAllClaims();
            
            return ResponseEntity.ok(GeneralResponse.success("All claims retrieved successfully", claims));
        } catch (Exception e) {
            log.error("Error getting all claims: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to get all claims: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
    
    @Override
    @DeleteMapping("/{claimId}")
    public ResponseEntity<GeneralResponse<Void>> deleteClaim(@PathVariable UUID claimId) {
        try {
            log.info("Deleting claim: {}", claimId);
            claimService.deleteClaim(claimId);
            
            return ResponseEntity.ok(GeneralResponse.success("Claim deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting claim: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    GeneralResponse.error("Failed to delete claim: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
}
