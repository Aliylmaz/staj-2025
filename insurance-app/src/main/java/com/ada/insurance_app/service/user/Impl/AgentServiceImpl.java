package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.dto.AgentDto;
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
import com.ada.insurance_app.repository.IAgentRepository;
import com.ada.insurance_app.repository.ICustomerRepository;
import com.ada.insurance_app.repository.IOfferRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.user.IAgentService;
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
    @Transactional
    public List<AgentDto> getAllAgents() {
        return agentRepository.findAll().stream()
                .map(agentMapper::toDto)
                .collect(Collectors.toList());
    }
} 