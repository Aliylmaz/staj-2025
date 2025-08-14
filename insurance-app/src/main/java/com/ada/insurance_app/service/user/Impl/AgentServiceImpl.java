package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.Offer;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.mapper.AgentMapper;
import com.ada.insurance_app.mapper.CustomerMapper;
import com.ada.insurance_app.mapper.OfferMapper;
import com.ada.insurance_app.mapper.PolicyMapper;
import com.ada.insurance_app.repository.*;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.dashboard.IDashboardService;
import com.ada.insurance_app.service.user.IAgentService;
import com.ada.insurance_app.service.user.helper.AgentServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.ada.insurance_app.core.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import com.ada.insurance_app.entity.Coverage;
import com.ada.insurance_app.entity.Payment;
import com.ada.insurance_app.mapper.PaymentMapper;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.service.user.IUserService;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentServiceImpl implements IAgentService {
    private final IOfferRepository offerRepository;
    private final ICustomerRepository customerRepository;
    private final IPolicyRepository policyRepository;
    private final IAgentRepository agentRepository;
    private final IClaimRepository claimRepository;
    private final IPaymentRepository paymentRepository;
    private final OfferMapper offerMapper;
    private final CustomerMapper customerMapper;
    private final PolicyMapper policyMapper;
    private final AgentMapper agentMapper;
    private final PaymentMapper paymentMapper;
    private final IDashboardService dashboardService;
    private final AgentServiceHelper agentHelper;
    private final IUserService userService;

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public OfferDto updateOfferStatus(OfferUpdateRequest request) {
        Offer offer = offerRepository.findById(request.getOfferId())
                .orElseThrow(() -> new RuntimeException("Offer not found: " + request.getOfferId()));
        offer.setStatus(request.getStatus());
        offer.setNote(request.getNote());
        offerRepository.save(offer);
        return offerMapper.toDto(offer);
    }

    /**
     * Agent can only see customers who have offers/policies processed by this agent
     * Optimized with single query instead of multiple findAll calls
     */
    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<CustomerDto> getMyCustomers() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        
        List<Customer> customers = customerRepository.findCustomersByAgentId(currentAgent.getId());
        log.info("=== getMyCustomers Debug ===");
        log.info("Total customers found: {}", customers.size());
        
        for (Customer customer : customers) {
            log.info("Customer ID: {}, User: {}", 
                    customer.getId(), 
                    customer.getUser() != null ? customer.getUser().getFirstName() + " " + customer.getUser().getLastName() : "NULL");
        }
        
        List<CustomerDto> customerDtos = customers.stream()
                .map(customerMapper::toDto)
                .collect(Collectors.toList());
        
        for (CustomerDto dto : customerDtos) {
            log.info("Customer DTO ID: {}, Name: {}, Email: {}", 
                    dto.getId(), dto.getFirstName() + " " + dto.getLastName(), dto.getEmail());
        }
        
        log.info("=== End getMyCustomers Debug ===");
        return customerDtos;
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public CustomerDto updateCustomer(UUID customerId, UpdateIndividualCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setCountry(request.getCountry());
        customer.setPostalCode(request.getPostalCode());


        customerRepository.save(customer);
        return customerMapper.toDto(customer);
    }



    @Override
    @Transactional(readOnly = true)
    public List<OfferDto> getoffersByAgentId(UUID agentId) {
        try {
            log.info("Fetching offers for agent: {}", agentId);
            
            Agent agent = agentHelper.getAgentById(agentId);
            if (agent == null) {
                log.warn("Agent not found with ID: {}", agentId);
                return new ArrayList<>();
            }
            
            List<Offer> offers = offerRepository.findByAgent_Id(agent.getId());
            log.info("Found {} offers for agent: {}", offers.size(), agentId);
            
            // Safe conversion with explicit iteration
            List<OfferDto> offerDtos = new ArrayList<>();
            for (Offer offer : offers) {
                try {
                    // Detailed offer information logging
                    log.info("=== Offer Details for ID: {} ===", offer.getId());
                    log.info("Offer Number: {}", offer.getOfferNumber());
                    log.info("Status: {}", offer.getStatus());
                    log.info("Total Premium: {}", offer.getTotalPremium());
                    log.info("Insurance Type: {}", offer.getInsuranceType());
                    log.info("Note: {}", offer.getNote());
                    log.info("Created At: {}", offer.getCreatedAt());
                    log.info("Updated At: {}", offer.getUpdatedAt());
                    
                    // Customer information
                    if (offer.getCustomer() != null) {
                        log.info("Customer ID: {}", offer.getCustomer().getId());
                        log.info("Customer Name: {} {}", 
                                offer.getCustomer().getUser() != null ? offer.getCustomer().getUser().getFirstName() : "null",
                                offer.getCustomer().getUser() != null ? offer.getCustomer().getUser().getLastName() : "null");
                    } else {
                        log.warn("Customer is NULL for offer {}", offer.getId());
                    }
                    
                    // Agent information
                    if (offer.getAgent() != null) {
                        log.info("Agent ID: {}", offer.getAgent().getId());
                        log.info("Agent Name: {}", offer.getAgent().getName());
                    } else {
                        log.info("Agent is NULL for offer {} (this is normal for PENDING offers)", offer.getId());
                    }
                    
                    // Coverages information
                    if (offer.getCoverages() != null) {
                        log.info("Coverages count: {}", offer.getCoverages().size());
                        for (Coverage coverage : offer.getCoverages()) {
                            log.info("  - Coverage: {} (ID: {})", coverage.getName(), coverage.getId());
                        }
                    } else {
                        log.warn("Coverages is NULL for offer {}", offer.getId());
                    }
                    
                    log.info("=== End Offer Details ===");
                    
                    OfferDto dto = offerMapper.toDto(offer);
                    if (dto != null) {
                        offerDtos.add(dto);
                        log.info("Successfully mapped offer {} to DTO", offer.getId());
                    } else {
                        log.error("Offer {} mapped to NULL DTO - this indicates a serious mapping issue", offer.getId());
                    }
                } catch (Exception e) {
                    log.error("Error mapping offer {} to DTO: {}", offer.getId(), e.getMessage(), e);
                    // Continue with other offers
                }
            }
            
            log.info("Successfully mapped {} out of {} offers to DTOs", offerDtos.size(), offers.size());
            return offerDtos;
        } catch (Exception e) {
            log.error("Error fetching offers for agent {}: {}", agentId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OfferDto getOfferById(Long offerId) {
        Offer offer = offerRepository.findByIdWithDetails(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));
        
        return offerMapper.toDto(offer);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public OfferDto approveOffer(Long offerId, UUID agentId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found: " + offerId));
        
        // Business rule: Can only approve PENDING offers
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Can only approve PENDING offers. Current status: " + offer.getStatus());
        }
        
        // Set agent and update status
        Agent agent = agentHelper.getAgentById(agentId);
        
        offer.setAgent(agent);
        offer.setStatus(OfferStatus.APPROVED);
        offer.setAcceptedAt(LocalDateTime.now());
        
        Offer savedOffer = offerRepository.save(offer);
        return offerMapper.toDto(savedOffer);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public OfferDto rejectOffer(Long offerId, UUID agentId, String reason) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found: " + offerId));
        
        // Business rule: Can only reject PENDING offers
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new RuntimeException("Can only reject PENDING offers. Current status: " + offer.getStatus());
        }
        
        // Set agent and update status
        Agent agent = agentHelper.getAgentById(agentId);
        
        offer.setAgent(agent);
        offer.setStatus(OfferStatus.REJECTED);
        offer.setNote(reason);
        
        Offer savedOffer = offerRepository.save(offer);
        return offerMapper.toDto(savedOffer);
    }

    @Override
    public AgentDto getCurrentAgent() {
        Agent agent = agentHelper.getCurrentAuthenticatedAgent();
        return agentMapper.toDto(agent);
    }

    @Override
    public AgentDto getAgentProfile(UUID agentId) {
        Agent agent = agentHelper.getAgentById(agentId);
        return agentMapper.toDto(agent);
    }

    @Override
    @Transactional
    public AgentDto updateAgentProfile(UUID agentId, AgentDto agentDto) {
        Agent agent = agentHelper.getAgentById(agentId);

        // Update agent details
        agent.setName(agentDto.getName());
        agent.setEmail(agentDto.getEmail());
        agent.setPhoneNumber(agentDto.getPhoneNumber());
        agent.setAddress(agentDto.getAddress());
        agent.setCity(agentDto.getCity());
        agent.setCountry(agentDto.getCountry());
        agent.setPostalCode(agentDto.getPostalCode());

        // Update user information if provided
        if (agent.getUser() != null && agentDto.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(agent.getUser().getId());
            userDto.setFirstName(agent.getUser().getFirstName()); // Keep existing firstName
            userDto.setLastName(agent.getUser().getLastName());   // Keep existing lastName
            userDto.setEmail(agentDto.getUser().getEmail());
            userDto.setPhoneNumber(agentDto.getUser().getPhoneNumber());
            
            userService.updateUser(agent.getUser().getId(), userDto);
        }

        // Save updated agent
        agentRepository.save(agent);
        return agentMapper.toDto(agent);
    }


    @Override
    public AgentStatsDto getMyStatistics() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return dashboardService.getAgentStatisticsById(currentAgent.getId());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public Long getMyActivePoliciesCount() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return policyRepository.findByAgentId(currentAgent.getId()).stream()
                .filter(policy -> "ACTIVE".equals(policy.getStatus().name()) || "PENDING_PAYMENT".equals(policy.getStatus().name()))
                .count();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public Long getMyPendingClaimsCount() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return claimRepository.countByAgent_Id(currentAgent.getId());
    }





    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public Long getMyCustomersCount() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return customerRepository.countCustomersByAgentId(currentAgent.getId());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<PolicyDto> getMyActivePolicies() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        
        return policyRepository.findByAgentId(currentAgent.getId()).stream()
                .filter(policy -> "ACTIVE".equals(policy.getStatus().name()) || "PENDING_PAYMENT".equals(policy.getStatus().name()))
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<PolicyDto> getMyExpiredPolicies() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return policyRepository.findByAgentId(currentAgent.getId()).stream()
                .filter(policy -> "EXPIRED".equals(policy.getStatus().name()))
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public PolicyDto assignPolicyToAgent(Long policyId, UUID agentId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));
        
        Agent agent = agentHelper.getAgentById(agentId);
        
        policy.setAgent(agent);
        policyRepository.save(policy);
        
        return policyMapper.toDto(policy);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public PolicyDto getPolicyById(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));


        return policyMapper.toDto(policy);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<CoverageDto> getPolicyCoverages(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));
        
        // Return policy coverages as a list of CoverageDto
        return policy.getCoverages().stream()
                .map(coverage -> {
                    CoverageDto dto = new CoverageDto();
                    dto.setId(coverage.getId());
                    dto.setName(coverage.getName());
                    dto.setDescription(coverage.getDescription());
                    dto.setBasePrice(coverage.getBasePrice());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public PolicyDto updatePolicyStatus(Long policyId, PolicyStatus newStatus) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));
        
        // Update policy status
        policy.setStatus(PolicyStatus.valueOf(newStatus.name()));
        policyRepository.save(policy);
        
        return policyMapper.toDto(policy);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<PaymentDto> getPaymentsByAgentId(UUID agentId) {
        log.info("Getting payments for agent: {}", agentId);
        
        // Get current authenticated agent to verify access
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        
        // Verify that the requested agentId matches the current authenticated agent
        if (!currentAgent.getId().equals(agentId)) {
            throw new RuntimeException("Access denied: Can only view own payments");
        }
        
        // Get payments for the agent
        List<Payment> payments = paymentRepository.findByAgentId(agentId);
        
        // Convert to DTOs
        return payments.stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }

} 