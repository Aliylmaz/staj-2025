package com.ada.insurance_app.service.policy;

import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.claim.UpdateClaimRequest;
import java.util.List;
import java.util.UUID;

public interface IClaimService {
    ClaimDto createClaim(ClaimDto claimDto, Long policyId);
    ClaimDto updateClaim(UUID claimId, ClaimDto claimDto);
    void deleteClaim(UUID claimId);
    ClaimDto getClaimById(UUID claimId);
    List<ClaimDto> getClaimsByPolicy(Long policyId);
    List<ClaimDto> getClaimsByCustomer(UUID customerId);
    List<ClaimDto> getAllClaims();
    
    // Request sınıflarını kullanan yeni metodlar
    ClaimDto createClaimFromRequest(CreateClaimRequest request);
    ClaimDto updateClaimFromRequest(UUID claimId, UpdateClaimRequest request);
}
