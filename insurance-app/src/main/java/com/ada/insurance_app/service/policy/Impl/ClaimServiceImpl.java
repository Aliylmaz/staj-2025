package com.ada.insurance_app.service.policy.Impl;

import com.ada.insurance_app.core.enums.ClaimStatus;
import com.ada.insurance_app.core.exception.ClaimNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.entity.Claim;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.mapper.ClaimMapper;
import com.ada.insurance_app.repository.IClaimRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.repository.IAgentRepository;
import com.ada.insurance_app.request.claim.CreateClaimRequest;
import com.ada.insurance_app.request.claim.UpdateClaimRequest;
import com.ada.insurance_app.service.policy.IClaimService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimServiceImpl implements IClaimService {
    private final IClaimRepository claimRepository;
    private final IPolicyRepository policyRepository;
    private final ClaimMapper claimMapper;
    private final IAgentRepository agentRepository;

    @Override
    @Transactional
    public ClaimDto createClaim(ClaimDto claimDto, Long policyId) {
        // Validate claim data
        validateClaimDto(claimDto);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Check if policy is active
        if (!"ACTIVE".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot create claim for inactive policy");
        }
        
        // Business rule: Check if claim amount is within policy coverage
        if (claimDto.getEstimatedAmount() != null &&
            claimDto.getEstimatedAmount().compareTo(policy.getPremium()) > 0) {
            throw new IllegalArgumentException("Claim amount cannot exceed policy coverage amount");
        }
        
        Claim claim = claimMapper.toEntity(claimDto);
        claim.setPolicy(policy);
        claim.setCreatedAt(LocalDateTime.now());
        claim.setStatus(ClaimStatus.SUBMITTED);
        
        Claim savedClaim = claimRepository.save(claim);
        log.info("Claim created successfully: {} for policy: {}", savedClaim.getId(), policyId);
        
        return claimMapper.toDto(savedClaim);
    }

    @Override
    @Transactional
    public ClaimDto updateClaim(UUID claimId, ClaimDto claimDto) {
        // Validate claim data
        validateClaimDto(claimDto);
        
        // Check if claim exists
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found with id: " + claimId));
        
        // Business rule: Cannot update processed claims
        if (!"PENDING".equals(claim.getStatus().name()) && !"IN_REVIEW".equals(claim.getStatus().name())) {
            throw new IllegalArgumentException("Cannot update claim that is already processed");
        }
        
        // Update claim fields
        claim.setDescription(claimDto.getDescription());
        claim.setEstimatedAmount(claimDto.getEstimatedAmount() != null ? claimDto.getEstimatedAmount() : BigDecimal.ZERO);
        claim.setIncidentDate(claimDto.getIncidentDate());
        claim.setUpdatedAt(LocalDateTime.now());
        
        Claim updatedClaim = claimRepository.save(claim);
        log.info("Claim updated successfully: {} with id: {}", updatedClaim.getId(), claimId);
        
        return claimMapper.toDto(updatedClaim);
    }

    @Override
    @Transactional
    public void deleteClaim(UUID claimId) {
        // Check if claim exists
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found with id: " + claimId));
        
        // Business rule: Cannot delete processed claims
        if (!"PENDING".equals(claim.getStatus().name())) {
            throw new IllegalArgumentException("Cannot delete claim that is already processed");
        }
        
        claimRepository.deleteById(claimId);
        log.info("Claim deleted successfully with id: {}", claimId);
    }

    @Override
    public ClaimDto getClaimById(UUID claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found with id: " + claimId));
        
        return claimMapper.toDto(claim);
    }

    @Override
    public List<ClaimDto> getClaimsByPolicy(Long policyId) {
        // Check if policy exists
        if (!policyRepository.existsById(policyId)) {
            throw new PolicyNotFoundException("Policy not found with id: " + policyId);
        }
        
        List<Claim> claims = claimRepository.findClaimByPolicy_Id(policyId);
        return claims.stream()
                .map(claimMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimDto> getClaimsByCustomer(UUID customerId) {
        List<Claim> claims = claimRepository.findByCustomerId(customerId);
        return claims.stream()
                .map(claimMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimDto> getAllClaims() {
        List<Claim> claims = claimRepository.findAll();
        return claims.stream()
                .map(claimMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClaimDto createClaimFromRequest(CreateClaimRequest request) {
        // Validate request
        validateCreateClaimRequest(request);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + request.getPolicyId()));
        
        // Business rule: Check if policy is active
        if (!"ACTIVE".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot create claim for inactive policy");
        }
        
        // Create claim entity from request
        Claim claim = new Claim();
        claim.setPolicy(policy);
        claim.setIncidentDate(request.getIncidentDate());
        claim.setDescription(request.getDescription());
        claim.setStatus(com.ada.insurance_app.core.enums.ClaimStatus.valueOf(request.getStatus().toUpperCase()));
        claim.setCreatedAt(LocalDateTime.now());
        
        claim.setClaimNumber(UUID.randomUUID().toString()); // Generate unique claim number
        
        Claim savedClaim = claimRepository.save(claim);
        log.info("Claim created from request successfully: {} for policy: {}", savedClaim.getId(), request.getPolicyId());
        
        return claimMapper.toDto(savedClaim);
    }

    @Override
    @Transactional
    public ClaimDto updateClaimFromRequest(UUID claimId, UpdateClaimRequest request) {
        // Validate request
        validateUpdateClaimRequest(request);
        
        // Check if claim exists
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found with id: " + claimId));
        
        // Business rule: Cannot update processed claims
        if (!"PENDING".equals(claim.getStatus().name()) && !"IN_REVIEW".equals(claim.getStatus().name())) {
            throw new IllegalArgumentException("Cannot update claim that is already processed");
        }
        
        // Update claim fields if provided
        if (request.getIncidentDate() != null) {
            if (request.getIncidentDate().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Incident date cannot be in the future");
            }
            claim.setIncidentDate(request.getIncidentDate());
        }
        
        if (StringUtils.hasText(request.getDescription())) {
            claim.setDescription(request.getDescription());
        }
        
        if (StringUtils.hasText(request.getStatus())) {
            claim.setStatus(com.ada.insurance_app.core.enums.ClaimStatus.valueOf(request.getStatus().toUpperCase()));
        }
        

        claim.setUpdatedAt(LocalDateTime.now());
        
        Claim updatedClaim = claimRepository.save(claim);
        log.info("Claim updated from request successfully: {} with id: {}", updatedClaim.getId(), claimId);
        
        return claimMapper.toDto(updatedClaim);
    }

    // Private validation methods
    private void validateClaimDto(ClaimDto claimDto) {
        if (claimDto == null) {
            throw new IllegalArgumentException("Claim data cannot be null");
        }
        
        if (!StringUtils.hasText(claimDto.getDescription())) {
            throw new IllegalArgumentException("Claim description is required");
        }
        
        if (claimDto.getIncidentDate() == null) {
            throw new IllegalArgumentException("Incident date is required");
        }
        
        if (claimDto.getIncidentDate().isAfter(ChronoLocalDate.from(LocalDateTime.now()))) {
            throw new IllegalArgumentException("Incident date cannot be in the future");
        }
        
        if (claimDto.getEstimatedAmount() != null && claimDto.getEstimatedAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Claim amount must be greater than zero");
        }
        

    }
    
    private void validateCreateClaimRequest(CreateClaimRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CreateClaimRequest cannot be null");
        }
        
        if (request.getPolicyId() == null) {
            throw new IllegalArgumentException("Policy ID is required");
        }
        
        if (request.getIncidentDate() == null) {
            throw new IllegalArgumentException("Incident date is required");
        }
        
        if (request.getIncidentDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Incident date cannot be in the future");
        }
        
        if (!StringUtils.hasText(request.getDescription())) {
            throw new IllegalArgumentException("Claim description is required");
        }
        
        if (!StringUtils.hasText(request.getStatus())) {
            throw new IllegalArgumentException("Claim status is required");
        }
        
        // Validate status enum
        try {
            com.ada.insurance_app.core.enums.ClaimStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid claim status: " + request.getStatus());
        }
    }
    
    private void validateUpdateClaimRequest(UpdateClaimRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("UpdateClaimRequest cannot be null");
        }
        
        // At least one field should be provided for update
        if (request.getIncidentDate() == null && !StringUtils.hasText(request.getDescription()) && 
            !StringUtils.hasText(request.getStatus()) && !StringUtils.hasText(request.getDocumentUrl())) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
        
        // Validate status enum if provided
        if (StringUtils.hasText(request.getStatus())) {
            try {
                com.ada.insurance_app.core.enums.ClaimStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid claim status: " + request.getStatus());
            }
        }
    }

    // Agent management methods
    @Override
    @Transactional
    public ClaimDto approveClaim(UUID claimId, UUID agentId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found: " + claimId));
        
        // Business rule: Can only approve PENDING or IN_REVIEW claims
        if (claim.getStatus() != ClaimStatus.PENDING && claim.getStatus() != ClaimStatus.IN_REVIEW) {
            throw new IllegalArgumentException("Can only approve PENDING or IN_REVIEW claims. Current status: " + claim.getStatus());
        }
        
        // Set agent and update status
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found: " + agentId));
        
        claim.setAgent(agent);
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setUpdatedAt(LocalDateTime.now());
        
        Claim savedClaim = claimRepository.save(claim);
        log.info("Claim approved by agent: {} for claim: {}", agentId, claimId);
        
        return claimMapper.toDto(savedClaim);
    }

    @Override
    @Transactional
    public ClaimDto rejectClaim(UUID claimId, UUID agentId, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found: " + claimId));
        
        // Business rule: Can only reject PENDING or IN_REVIEW claims
        if (claim.getStatus() != ClaimStatus.PENDING && claim.getStatus() != ClaimStatus.IN_REVIEW) {
            throw new IllegalArgumentException("Can only reject PENDING or IN_REVIEW claims. Current status: " + claim.getStatus());
        }
        
        // Set agent and update status
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new IllegalArgumentException("Agent not found: " + agentId));
        
        claim.setAgent(agent);
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionReason(reason);
        claim.setUpdatedAt(LocalDateTime.now());
        
        Claim savedClaim = claimRepository.save(claim);
        log.info("Claim rejected by agent: {} for claim: {} with reason: {}", agentId, claimId, reason);
        
        return claimMapper.toDto(savedClaim);
    }

    @Override
    public List<ClaimDto> getClaimsByAgent(UUID agentId) {
        List<Claim> claims = claimRepository.findByAgent_Id(agentId);
        return claims.stream().map(claimMapper::toDto).toList();
    }
}
