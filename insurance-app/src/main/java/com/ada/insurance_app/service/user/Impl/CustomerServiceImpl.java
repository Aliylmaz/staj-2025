package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.exception.ClaimNotFoundException;
import com.ada.insurance_app.core.exception.CustomerNotFoundException;
import com.ada.insurance_app.core.exception.DocumentNotFoundException;
import com.ada.insurance_app.core.exception.PolicyNotFoundException;
import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.entity.Claim;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.Document;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.mapper.ClaimMapper;
import com.ada.insurance_app.mapper.CustomerMapper;
import com.ada.insurance_app.mapper.DocumentMapper;
import com.ada.insurance_app.mapper.PolicyMapper;
import com.ada.insurance_app.repository.IClaimRepository;
import com.ada.insurance_app.repository.ICustomerRepository;
import com.ada.insurance_app.repository.IDocumentRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.request.customer.AddCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.AddIndividualCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.service.user.ICustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements ICustomerService {
    private final IPolicyRepository policyRepository;
    private final IDocumentRepository documentRepository;
    private final IClaimRepository claimRepository;
    private final ICustomerRepository customerRepository;
    private final PolicyMapper policyMapper;
    private final DocumentMapper documentMapper;
    private final ClaimMapper claimMapper;
    private final CustomerMapper customerMapper;

    @Override
    public List<PolicyDto> getMyPolicies(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        List<Policy> policies = policyRepository.findByCustomerId(customerId);
        return policies.stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentDto> getMyDocuments(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        List<Document> documents = documentRepository.findByCustomerId(customerId);
        return documents.stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClaimDto> getMyClaims(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        List<Claim> claims = claimRepository.findByCustomerId(customerId);
        return claims.stream()
                .map(claimMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PolicyDto getPolicyById(Long policyId, UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        Policy policy = policyRepository.findByIdAndCustomerId(policyId, customerId)
                .orElseThrow(() -> new PolicyNotFoundException("Policy not found for customer: " + customerId));
        
        return policyMapper.toDto(policy);
    }

    @Override
    public DocumentDto getDocumentById(Long documentId, UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        Document document = documentRepository.findByIdAndCustomerId(documentId, customerId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found for customer: " + customerId));
        
        return documentMapper.toDto(document);
    }

    @Override
    public ClaimDto getClaimById(UUID claimId, UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);
        
        Claim claim = claimRepository.findByIdAndPolicy_Customer_Id(claimId, customerId)
                .orElseThrow(() -> new ClaimNotFoundException("Claim not found for customer: " + customerId));
        
        return claimMapper.toDto(claim);
    }

    @Override
    @Transactional
    public PolicyDto createPolicy(PolicyDto policyDto, UUID customerId) {
        // Validate customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Validate policy data
        validatePolicyDto(policyDto);
        
        Policy policy = policyMapper.toEntity(policyDto);
        policy.setCustomer(customer);
        
        Policy savedPolicy = policyRepository.save(policy);
        log.info("Policy created successfully: {} for customer: {}", savedPolicy.getId(), customerId);
        
        return policyMapper.toDto(savedPolicy);
    }

    @Override
    @Transactional
    public CustomerDto createIndividualCustomer(AddIndividualCustomerRequest request) {
        // Validate request
        validateAddIndividualCustomerRequest(request);
        
        // Check if customer already exists with same national ID
        if (customerRepository.existsByNationalId(request.getNationalId())) {
            throw new IllegalArgumentException("Customer with national ID already exists: " + request.getNationalId());
        }
        
        // Create customer entity from request
        Customer customer = new Customer();
        customer.getUser().setId(request.getUserId());
        customer.setCustomerNumber(generateCustomerNumber());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setCountry(request.getCountry());
        customer.setPostalCode(request.getPostalCode());
        customer.setNationalId(request.getNationalId());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setCustomerType(com.ada.insurance_app.core.enums.CustomerType.INDIVIDUAL);
        customer.setCreatedAt(LocalDateTime.now());
        
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Individual customer created successfully: {} with ID: {}", savedCustomer.getId(), request.getNationalId());
        
        return customerMapper.toDto(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerDto createCorporateCustomer(AddCorporateCustomerRequest request) {
        // Validate request
        validateAddCorporateCustomerRequest(request);
        
        // Check if customer already exists with same tax number
        if (customerRepository.existsByTaxNumber(request.getTaxNumber())) {
            throw new IllegalArgumentException("Customer with tax number already exists: " + request.getTaxNumber());
        }
        
        // Create customer entity from request
        Customer customer = new Customer();
        customer.getUser().setId(request.getUserId());
        customer.setCustomerNumber(generateCustomerNumber());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setCountry(request.getCountry());
        customer.setPostalCode(request.getPostalCode());
        customer.setCompanyName(request.getCompanyName());
        customer.setTaxNumber(request.getTaxNumber());
        customer.setCompanyRegistrationNumber(request.getCompanyRegistrationNumber());
        customer.setCustomerType(com.ada.insurance_app.core.enums.CustomerType.CORPORATE);
        customer.setCreatedAt(LocalDateTime.now());
        
        Customer savedCustomer = customerRepository.save(customer);
        log.info("Corporate customer created successfully: {} with tax number: {}", savedCustomer.getId(), request.getTaxNumber());
        
        return customerMapper.toDto(savedCustomer);
    }

    @Override
    @Transactional
    public CustomerDto updateIndividualCustomer(UUID customerId, UpdateIndividualCustomerRequest request) {
        // Validate request
        validateUpdateIndividualCustomerRequest(request);
        
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Check if customer is individual type
        if (customer.getCustomerType() != com.ada.insurance_app.core.enums.CustomerType.INDIVIDUAL) {
            throw new IllegalArgumentException("Customer is not an individual customer");
        }
        
        // Update customer fields if provided
        if (StringUtils.hasText(request.getAddress())) {
            customer.setAddress(request.getAddress());
        }
        
        if (StringUtils.hasText(request.getCity())) {
            customer.setCity(request.getCity());
        }
        
        if (StringUtils.hasText(request.getCountry())) {
            customer.setCountry(request.getCountry());
        }
        
        if (StringUtils.hasText(request.getPostalCode())) {
            customer.setPostalCode(request.getPostalCode());
        }
        
        if (StringUtils.hasText(request.getNationalId())) {
            // Check if national ID is already used by another customer
            if (!request.getNationalId().equals(customer.getNationalId()) && 
                customerRepository.existsByNationalId(request.getNationalId())) {
                throw new IllegalArgumentException("National ID already exists: " + request.getNationalId());
            }
            customer.setNationalId(request.getNationalId());
        }
        
        if (request.getDateOfBirth() != null) {
            customer.setDateOfBirth(request.getDateOfBirth());
        }
        
        customer.setUpdatedAt(LocalDateTime.now());
        
        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Individual customer updated successfully: {}", customerId);
        
        return customerMapper.toDto(updatedCustomer);
    }

    @Override
    @Transactional
    public CustomerDto updateCorporateCustomer(UUID customerId, UpdateCorporateCustomerRequest request) {
        // Validate request
        validateUpdateCorporateCustomerRequest(request);
        
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Check if customer is corporate type
        if (customer.getCustomerType() != com.ada.insurance_app.core.enums.CustomerType.CORPORATE) {
            throw new IllegalArgumentException("Customer is not a corporate customer");
        }
        
        // Update customer fields if provided
        if (StringUtils.hasText(request.getAddress())) {
            customer.setAddress(request.getAddress());
        }
        
        if (StringUtils.hasText(request.getCity())) {
            customer.setCity(request.getCity());
        }
        
        if (StringUtils.hasText(request.getCountry())) {
            customer.setCountry(request.getCountry());
        }
        
        if (StringUtils.hasText(request.getPostalCode())) {
            customer.setPostalCode(request.getPostalCode());
        }
        
        if (StringUtils.hasText(request.getCompanyName())) {
            customer.setCompanyName(request.getCompanyName());
        }
        
        if (StringUtils.hasText(request.getTaxNumber())) {
            // Check if tax number is already used by another customer
            if (!request.getTaxNumber().equals(customer.getTaxNumber()) && 
                customerRepository.existsByTaxNumber(request.getTaxNumber())) {
                throw new IllegalArgumentException("Tax number already exists: " + request.getTaxNumber());
            }
            customer.setTaxNumber(request.getTaxNumber());
        }
        
        if (StringUtils.hasText(request.getCompanyRegistrationNumber())) {
            customer.setCompanyRegistrationNumber(request.getCompanyRegistrationNumber());
        }
        
        customer.setUpdatedAt(LocalDateTime.now());
        
        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Corporate customer updated successfully: {}", customerId);
        
        return customerMapper.toDto(updatedCustomer);
    }

    @Override
    public CustomerDto getCustomerById(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        return customerMapper.toDto(customer);
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(customerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCustomer(UUID customerId) {
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));
        
        // Business rule: Cannot delete customer with active policies
        List<Policy> activePolicies = policyRepository.findByCustomerId(customerId);
        boolean hasActivePolicies = activePolicies.stream()
                .anyMatch(policy -> "ACTIVE".equals(policy.getStatus().name()));
        
        if (hasActivePolicies) {
            throw new IllegalArgumentException("Cannot delete customer with active policies");
        }
        
        customerRepository.deleteById(customerId);
        log.info("Customer deleted successfully with id: {}", customerId);
    }

    // Private validation methods
    private void validateCustomerExists(UUID customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
        }
    }

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
    
    private void validateAddIndividualCustomerRequest(AddIndividualCustomerRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("AddIndividualCustomerRequest cannot be null");
        }
        
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (!StringUtils.hasText(request.getNationalId())) {
            throw new IllegalArgumentException("National ID is required");
        }
        
        if (request.getDateOfBirth() == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        
        if (request.getDateOfBirth().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }
    }
    
    private void validateAddCorporateCustomerRequest(AddCorporateCustomerRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("AddCorporateCustomerRequest cannot be null");
        }
        
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (!StringUtils.hasText(request.getCompanyName())) {
            throw new IllegalArgumentException("Company name is required");
        }
        
        if (!StringUtils.hasText(request.getTaxNumber())) {
            throw new IllegalArgumentException("Tax number is required");
        }
        
        if (!StringUtils.hasText(request.getCompanyRegistrationNumber())) {
            throw new IllegalArgumentException("Company registration number is required");
        }
    }
    
    private void validateUpdateIndividualCustomerRequest(UpdateIndividualCustomerRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("UpdateIndividualCustomerRequest cannot be null");
        }
        
        // At least one field should be provided for update
        if (!StringUtils.hasText(request.getAddress()) && !StringUtils.hasText(request.getCity()) && 
            !StringUtils.hasText(request.getCountry()) && !StringUtils.hasText(request.getPostalCode()) &&
            !StringUtils.hasText(request.getNationalId()) && request.getDateOfBirth() == null) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
    }
    
    private void validateUpdateCorporateCustomerRequest(UpdateCorporateCustomerRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("UpdateCorporateCustomerRequest cannot be null");
        }
        
        // At least one field should be provided for update
        if (!StringUtils.hasText(request.getAddress()) && !StringUtils.hasText(request.getCity()) && 
            !StringUtils.hasText(request.getCountry()) && !StringUtils.hasText(request.getPostalCode()) &&
            !StringUtils.hasText(request.getCompanyName()) && !StringUtils.hasText(request.getTaxNumber()) &&
            !StringUtils.hasText(request.getCompanyRegistrationNumber())) {
            throw new IllegalArgumentException("At least one field must be provided for update");
        }
    }
    
    private String generateCustomerNumber() {
        return "CUST-" + System.currentTimeMillis();
    }
}
