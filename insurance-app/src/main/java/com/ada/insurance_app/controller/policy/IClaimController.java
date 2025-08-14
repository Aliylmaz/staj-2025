package com.ada.insurance_app.controller.policy;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.claim.UpdateClaimRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

public interface IClaimController {
    
    // Claim request endpoint
    ResponseEntity<GeneralResponse<ClaimDto>> requestClaim(CreateClaimRequest request);

    ResponseEntity<GeneralResponse<ClaimDto>> createClaim( CreateClaimRequest request);
    
    ResponseEntity<GeneralResponse<ClaimDto>> updateClaim( UUID claimId,  UpdateClaimRequest request);
    
    ResponseEntity<GeneralResponse<ClaimDto>> getClaim( UUID claimId);
    
    ResponseEntity<GeneralResponse<List<ClaimDto>>> getClaimsByPolicy( Long policyId);
    
    ResponseEntity<GeneralResponse<List<ClaimDto>>> getClaimsByCustomer( UUID customerId);
    
    ResponseEntity<GeneralResponse<List<ClaimDto>>> getAllClaims();
    
    ResponseEntity<GeneralResponse<Void>> deleteClaim( UUID claimId);
    
    // Agent management endpoints
    ResponseEntity<GeneralResponse<ClaimDto>> approveClaim(UUID claimId, UUID agentId, BigDecimal approvedAmount);
    ResponseEntity<GeneralResponse<ClaimDto>> rejectClaim(UUID claimId, UUID agentId, String reason);
    ResponseEntity<GeneralResponse<List<ClaimDto>>> getClaimsByAgent(UUID agentId);
}
