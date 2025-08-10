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
import com.ada.insurance_app.service.dashboard.IDashboardService;
import com.ada.insurance_app.service.user.IAgentService;
import com.ada.insurance_app.service.user.helper.AgentServiceHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final OfferMapper offerMapper;
    private final CustomerMapper customerMapper;
    private final PolicyMapper policyMapper;
    private final AgentMapper agentMapper;
    private final IDashboardService dashboardService;
    private final AgentServiceHelper agentHelper;

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
        
        return customerRepository.findCustomersByAgentId(currentAgent.getId()).stream()
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
    @Transactional(readOnly = true)
    public List<OfferDto> getAllOffers() {
        // Only return PENDING offers for agents to review
        List<Offer> offers = offerRepository.findByStatus(OfferStatus.PENDING);



        return offers.stream()
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
        Agent agent = agentHelper.getAgentById(agentId);
        
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
        return policyRepository.countByAgentId(currentAgent.getId());
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
                .filter(policy -> "ACTIVE".equals(policy.getStatus())) // Assuming you have status field
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('AGENT')")
    public List<PolicyDto> getMyExpiredPolicies() {
        Agent currentAgent = agentHelper.getCurrentAuthenticatedAgent();
        return policyRepository.findByAgentId(currentAgent.getId()).stream()
                .filter(policy -> "EXPIRED".equals(policy.getStatus())) // Assuming you have status field
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




} 