package com.ada.insurance_app.service.policy.Impl;

import com.ada.insurance_app.core.exception.AgentNotFoundException;
import com.ada.insurance_app.core.exception.CustomerNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.mapper.PolicyMapper;
import com.ada.insurance_app.repository.AgentRepository;
import com.ada.insurance_app.repository.ICustomerRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.request.policy.CreatePolicyRequest;
import com.ada.insurance_app.request.policy.UpdatePolicyRequest;
import com.ada.insurance_app.request.policy.CancelPolicyRequest;
import com.ada.insurance_app.service.policy.IPolicyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyServiceImpl implements IPolicyService {
    private final IPolicyRepository policyRepository;
    private final AgentRepository agentRepository;
    private final ICustomerRepository customerRepository;
    private final PolicyMapper policyMapper;

    @Override
    @Transactional
    public PolicyDto createPolicy(PolicyDto policyDto, UUID agentId, UUID customerId) {
        // Validate input
        validatePolicyDto(policyDto);
        
        // Check if agent exists
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new AgentNotFoundException("Agent not found with id: " + agentId));
        
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Business rule: Check if customer already has active policy for same insurance type
        List<Policy> existingPolicies = policyRepository.findByCustomerId(customerId);
        boolean hasActivePolicy = existingPolicies.stream()
                .anyMatch(policy -> policy.getInsuranceType().equals(policyDto.getInsuranceType()) && 
                                  policy.getStatus().name().equals("ACTIVE"));
        
        if (hasActivePolicy) {
            throw new IllegalArgumentException("Customer already has an active policy for this insurance type");
        }
        
        // Business rule: Validate policy dates
        if (policyDto.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Policy start date cannot be in the past");
        }
        
        if (policyDto.getEndDate().isBefore(policyDto.getStartDate())) {
            throw new IllegalArgumentException("Policy end date must be after start date");
        }
        
        Policy policy = policyMapper.toEntity(policyDto);
        policy.setAgent(agent);
        policy.setCustomer(customer);
        
        Policy savedPolicy = policyRepository.save(policy);
        log.info("Policy created successfully: {} for customer: {}", savedPolicy.getId(), customerId);
        
        return policyMapper.toDto(savedPolicy);
    }

    @Override
    @Transactional
    public PolicyDto updatePolicy(Long policyId, PolicyDto policyDto) {
        // Validate input
        validatePolicyDto(policyDto);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Cannot update cancelled policies
        if ("CANCELLED".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot update a cancelled policy");
        }
        
        // Business rule: Validate policy dates
        if (policyDto.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Policy start date cannot be in the past");
        }
        
        if (policyDto.getEndDate().isBefore(policyDto.getStartDate())) {
            throw new IllegalArgumentException("Policy end date must be after start date");
        }
        
        // Update policy fields
        policy.setStatus(policyDto.getStatus());
        policy.setStartDate(policyDto.getStartDate());
        policy.setEndDate(policyDto.getEndDate());
        policy.setPremium(policyDto.getPremium());
        policy.setPremium(policyDto.getPremium());

        
        Policy updatedPolicy = policyRepository.save(policy);
        log.info("Policy updated successfully: {} with id: {}", updatedPolicy.getId(), policyId);
        
        return policyMapper.toDto(updatedPolicy);
    }

    @Override
    @Transactional
    public void deletePolicy(Long policyId) {
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Cannot delete active policies
        if ("ACTIVE".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot delete an active policy. Please cancel it first.");
        }
        
        policyRepository.deleteById(policyId);
        log.info("Policy deleted successfully with id: {}", policyId);
    }

    @Override
    public PolicyDto getPolicyById(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        return policyMapper.toDto(policy);
    }

    @Override
    public List<PolicyDto> getPoliciesByAgent(UUID agentId) {
        // Check if agent exists
        if (!agentRepository.existsById(agentId)) {
            throw new AgentNotFoundException("Agent not found with id: " + agentId);
        }
        
        List<Policy> policies = policyRepository.findByAgentId(agentId);
        return policies.stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PolicyDto> getPoliciesByCustomer(UUID customerId) {
        // Check if customer exists
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }
        
        List<Policy> policies = policyRepository.findByCustomerId(customerId);
        return policies.stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PolicyDto> getAllPolicies() {
        List<Policy> policies = policyRepository.findAll();
        return policies.stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PolicyDto createPolicyFromRequest(CreatePolicyRequest request) {
        // Validate request
        validateCreatePolicyRequest(request);
        
        // Check if customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + request.getCustomerId()));
        
        // Check if agent exists (if provided)
        Agent agent = null;
        if (request.getAgentId() != null) {
            agent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new AgentNotFoundException("Agent not found with id: " + request.getAgentId()));
        }
        
        // Business rule: Check if customer already has active policy for same insurance type
        List<Policy> existingPolicies = policyRepository.findByCustomerId(request.getCustomerId());
        boolean hasActivePolicy = existingPolicies.stream()
                .anyMatch(policy -> policy.getInsuranceType().equals(request.getInsuranceType()) && 
                                  policy.getStatus().name().equals("ACTIVE"));
        
        if (hasActivePolicy) {
            throw new IllegalArgumentException("Customer already has an active policy for this insurance type");
        }
        
        // Business rule: Validate policy dates
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Policy start date cannot be in the past");
        }
        
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Policy end date must be after start date");
        }
        
        // Create policy entity from request
        Policy policy = new Policy();
        policy.setCustomer(customer);
        policy.setAgent(agent);
        policy.setStatus(request.getStatus());
        policy.setStartDate(request.getStartDate());
        policy.setEndDate(request.getEndDate());
        policy.setPremium(request.getPremium());
        policy.setInsuranceType(request.getInsuranceType());
        
        // Set insurance type specific details
        if (request.getVehicleId() != null) {
            // Handle vehicle insurance
            policy.getVehicle().setId(request.getVehicleId());
        }
        
        if (request.getHealthDetailId() != null) {
            // Handle health insurance
            policy.getHealthInsuranceDetail().setId(request.getHealthDetailId());
        }
        if (request.getHomeDetailId() != null) {
            // Handle home insurance
            policy.getHomeInsuranceDetail().setId(request.getHomeDetailId());
        }
        
        Policy savedPolicy = policyRepository.save(policy);
        log.info("Policy created from request successfully: {} for customer: {}", savedPolicy.getId(), request.getCustomerId());
        
        return policyMapper.toDto(savedPolicy);
    }

    @Override
    @Transactional
    public PolicyDto updatePolicyFromRequest(Long policyId, UpdatePolicyRequest request) {
        // Validate request
        validateUpdatePolicyRequest(request);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Cannot update cancelled policies
        if ("CANCELLED".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Cannot update a cancelled policy");
        }
        
        // Update policy fields if provided
        if (request.getStatus() != null) {
            policy.setStatus(request.getStatus());
        }
        
        if (request.getStartDate() != null) {
            if (request.getStartDate().isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Policy start date cannot be in the past");
            }
            policy.setStartDate(request.getStartDate());
        }
        
        if (request.getEndDate() != null) {
            if (request.getEndDate().isBefore(policy.getStartDate())) {
                throw new IllegalArgumentException("Policy end date must be after start date");
            }
            policy.setEndDate(request.getEndDate());
        }
        
        if (request.getPremium() != null) {
            policy.setPremium(request.getPremium());
        }
        
        Policy updatedPolicy = policyRepository.save(policy);
        log.info("Policy updated from request successfully: {} with id: {}", updatedPolicy.getId(), policyId);
        
        return policyMapper.toDto(updatedPolicy);
    }

    @Override
    @Transactional
    public void cancelPolicyFromRequest(Long policyId, CancelPolicyRequest request) {
        // Validate request
        validateCancelPolicyRequest(request);
        
        // Check if policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found with id: " + policyId));
        
        // Business rule: Cannot cancel already cancelled policies
        if ("CANCELLED".equals(policy.getStatus().name())) {
            throw new IllegalArgumentException("Policy is already cancelled");
        }
        
        // Business rule: Cannot cancel expired policies
        if (policy.getEndDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot cancel an expired policy");
        }
        
        // Cancel the policy
        policy.setStatus(request.getStatus());

        policy.setCancellationReason(request.getCancelationReason());
        
        policyRepository.save(policy);
        log.info("Policy cancelled from request successfully: {} with id: {}", policy.getId(), policyId);
    }

    // Private validation methods
    private void validatePolicyDto(PolicyDto policyDto) {
        if (policyDto == null) {
            throw new IllegalArgumentException("Policy data cannot be null");
        }
        
        if (policyDto.getInsuranceType() == null) {
            throw new IllegalArgumentException("Insurance type is required");
        }
        
        if (policyDto.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (policyDto.getEndDate() == null) {
            throw new IllegalArgumentException("End date is required");
        }
        
        if (policyDto.getPremium() == null || policyDto.getPremium().doubleValue() <= 0) {
            throw new IllegalArgumentException("Premium must be greater than zero");
        }
        

    }
    
    private void validateCreatePolicyRequest(CreatePolicyRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CreatePolicyRequest cannot be null");
        }
        
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required");
        }
        
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Policy status is required");
        }
        
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (request.getEndDate() == null) {
            throw new IllegalArgumentException("End date is required");
        }
        
        if (request.getPremium() == null || request.getPremium().doubleValue() <= 0) {
            throw new IllegalArgumentException("Premium must be greater than zero");
        }
        
        if (request.getInsuranceType() == null) {
            throw new IllegalArgumentException("Insurance type is required");
        }
    }
    
    private void validateUpdatePolicyRequest(UpdatePolicyRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("UpdatePolicyRequest cannot be null");
        }
        
        // At least one field should be provided for update
        if (request.getStatus() == null && request.getStartDate() == null && 
            request.getEndDate() == null && request.getPremium() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
    }
    
    private void validateCancelPolicyRequest(CancelPolicyRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("CancelPolicyRequest cannot be null");
        }
        
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Cancellation status is required");
        }
        
        if (!StringUtils.hasText(request.getCancelationReason())) {
            throw new IllegalArgumentException("Cancellation reason is required");
        }
        if (request.getPolicyId() == null) {
            throw new IllegalArgumentException("Policy ID is required for cancellation");
        }

    }
}
