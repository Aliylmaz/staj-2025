package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.dto.PolicyDto;
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
import com.ada.insurance_app.service.user.IAgentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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

    @Override
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customerMapper::toDto)
                .collect(Collectors.toList());
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
    @Transactional
    @PreAuthorize("hasRole('AGENT')")
    public List<PolicyDto> getMyPolicies(UUID agentId) {
        return policyRepository.findByAgentId(agentId).stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OfferDto> getAllOffers() {
        // Only return PENDING offers for agents to review
        return offerRepository.findByStatus(OfferStatus.PENDING).stream()
                .map(offerMapper::toDto)
                .collect(Collectors.toList());
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
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        
        offer.setAgent(agent);
        offer.setStatus(OfferStatus.APPROVED);
        offer.setAcceptedAt(java.time.LocalDateTime.now());
        
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
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        
        offer.setAgent(agent);
        offer.setStatus(OfferStatus.REJECTED);
        offer.setNote(reason);
        
        Offer savedOffer = offerRepository.save(offer);
        return offerMapper.toDto(savedOffer);
    }

    @Override
    public AgentDto getCurrentAgent() {
        // Get current agent from security context
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Try to find by username first, then by email
        Agent agent = agentRepository.findAll().stream()
                .filter(a -> a.getUser().getUsername().equals(currentUsername) || a.getUser().getEmail().equals(currentUsername))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Current agent not found with username/email: " + currentUsername));
        
        return agentMapper.toDto(agent);
    }

    @Override
    public AgentDto getAgentProfile(UUID agentId) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
        return agentMapper.toDto(agent);
    }

    @Override
    public AgentDto updateAgentProfile(UUID agentId, AgentDto agentDto) {
        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));

        // Update agent details
        agent.setName(agentDto.getName());
        agent.setEmail(agentDto.getEmail());
        agent.setPhoneNumber(agentDto.getPhoneNumber());
        agent.setAddress(agentDto.getAddress());
        agent.setCity(agentDto.getCity());
        agent.setCountry(agentDto.getCountry());
        agent.setPostalCode(agentDto.getPostalCode());

        // Save updated agent
        agentRepository.save(agent);
        return agentMapper.toDto(agent);
    }


    @Override
    public AgentStatsDto getMyStatistics() {
        // Get current agent directly from repository
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Agent agent = agentRepository.findAll().stream()
                .filter(a -> a.getUser().getUsername().equals(currentUsername) || a.getUser().getEmail().equals(currentUsername))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Current agent not found with username/email: " + currentUsername));

        String agentNumber = agent.getAgentNumber();

        long policyCount = policyRepository.countPoliciesByAgent_AgentNumber(agentNumber);
        long claimCount = claimRepository.countByPolicy_Agent_AgentNumber(agentNumber);
        long paymentCount = paymentRepository.countByPolicy_Agent_AgentNumber(agentNumber);
        double totalPremium = policyRepository.sumTotalPremiumByAgentNumber(agentNumber);

        AgentStatsDto agentStats = new AgentStatsDto();
        agentStats.setAgentName(agent.getName());
        agentStats.setAgentNumber(agent.getAgentNumber());
        agentStats.setTotalPolicies(policyCount);
        agentStats.setTotalClaims(claimCount);
        agentStats.setTotalPayments(paymentCount);
        agentStats.setTotalPremium(totalPremium);
        agentStats.setSuccessRate(claimCount > 0 ? (double) paymentCount / claimCount * 100 : 0.0);

        return agentStats;
    }

    @Override
    public Long getMyActivePoliciesCount(UUID agentId) {
        //return policyRepository.countByAgentIdAndStatus(agentId, com.ada.insurance_app.core.enums.PolicyStatus.ACTIVE);
        return  null;
    }

    @Override
    public Long getMyPendingClaimsCount(UUID agentId) {
        //return claimRepository.countByAgentIdAndStatus(agentId, com.ada.insurance_app.core.enums.ClaimStatus.PENDING);
        return null;
    }



    @Override
    public List<CustomerDto> getMyCustomers(UUID agentId) {
        return List.of();
    }

    @Override
    public CustomerDto assignCustomerToAgent(UUID customerId, UUID agentId) {
        return null;
    }

    @Override
    public CustomerDto removeCustomerFromAgent(UUID customerId, UUID agentId) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public Long getMyCustomersCount(UUID agentId) {
        if (agentId == null) {
            throw new IllegalArgumentException("agentId must not be null");
        }

        // Ensure the agent exists to avoid returning counts for non-existent principals
        boolean agentExists = agentRepository.existsById(agentId);
        if (!agentExists) {
            throw new RuntimeException("Agent not found: " + agentId);
        }

        // Count distinct customers who have policies assigned to this agent
        Long count = customerRepository.countByAgentId(agentId);
        return count != null ? count : 0L;
    }

    @Override
    public List<PolicyDto> getMyActivePolicies(UUID agentId) {
        return List.of();
    }

    @Override
    public List<PolicyDto> getMyExpiredPolicies(UUID agentId) {
        return List.of();
    }

    @Override
    public PolicyDto assignPolicyToAgent(Long policyId, UUID agentId) {
        return null;
    }

    @Override
    public Double getCommissionForPolicy(Long policyId, UUID agentId) {
        return 0.0;
    }

    @Override
    public List<PolicyDto> getPoliciesForCommissionCalculation(UUID agentId, String month, String year) {
        return List.of();
    }


} 