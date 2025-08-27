package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.*;
import com.ada.insurance_app.core.exception.*;
import com.ada.insurance_app.core.security.SecurityUtils;
import com.ada.insurance_app.dto.*;
import com.ada.insurance_app.entity.*;
import com.ada.insurance_app.mapper.*;
import com.ada.insurance_app.repository.*;
import com.ada.insurance_app.repository.auth.User.IUserRepository;
import com.ada.insurance_app.request.claim.CreateClaimRequest;

import com.ada.insurance_app.request.customer.BaseCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateCorporateCustomerRequest;
import com.ada.insurance_app.request.customer.UpdateIndividualCustomerRequest;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.payment.CreatePaymentRequest;
import com.ada.insurance_app.service.user.ICustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.lang.IllegalArgumentException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.ada.insurance_app.repository.IAgentRepository;
import com.ada.insurance_app.service.document.IDocumentService;
import com.ada.insurance_app.service.vehicle.IVehicleService;
import com.ada.insurance_app.service.HealthInsuranceDetail.IHealthInsuranceDetailService;
import com.ada.insurance_app.service.HomeInsuranceDetail.IHomeInsuranceDetailService;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements ICustomerService {
    private final IPolicyRepository policyRepository;
    private final IDocumentRepository documentRepository;
    private final IClaimRepository claimRepository;
    private final ICustomerRepository customerRepository;
    private final IOfferRepository offerRepository;
    private final IVehicleRepository vehicleRepository;
    private final IHealthInsuranceDetailRepository healthInsuranceDetailRepository;
    private final IHomeInsuranceDetailRepository homeInsuranceDetailRepository;
    private final IPaymentRepository paymentRepository;
    private final ICoverageRepository coverageRepository;
    private final IAgentRepository agentRepository;
    private final PolicyMapper policyMapper;
    private final DocumentMapper documentMapper;
    private final  AgentMapper agentMapper;
    private final ClaimMapper claimMapper;
    private final CustomerMapper customerMapper;
    private final OfferMapper offerMapper;
    private final PaymentMapper paymentMapper;
    private final IUserRepository userRepository;
    private final IDocumentService documentService;
    private final IVehicleService vehicleService;
    private final IHealthInsuranceDetailService healthInsuranceDetailService;
    private final IHomeInsuranceDetailService homeInsuranceDetailService;

    @Override
    public List<PolicyDto> getMyPolicies(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);

        List<Policy> policies = policyRepository.findByCustomer_Id(customerId);
        return policies.stream()
                .map(policyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentDto> getMyDocuments(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);

        List<Document> documents = documentRepository.findByCustomer_Id(customerId);
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

    @Transactional(readOnly = true)
    public List<OfferDto> getMyOffers(UUID customerId) {
        List<Offer> offers = offerRepository.findByCustomer_Id(customerId);

        return offers.stream()
                .map(offerMapper::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<PaymentDto> getMyPayments(UUID customerId) {
        validateCustomerExists(customerId);
        log.info("getMyPayments: Fetching payments for customer: {}", customerId);
        
        // Fetch payments by customer ID using the new repository method
        List<Payment> payments = paymentRepository.findByCustomerId(customerId);
        log.info("getMyPayments: Found {} payments for customer: {}", payments.size(), customerId);
        
        // Log each payment for debugging
        payments.forEach(payment -> {
            log.info("getMyPayments: Payment ID: {}, Policy ID: {}, Status: {}, Amount: {}", 
                    payment.getId(), payment.getPolicy().getId(), payment.getStatus(), payment.getAmount());
        });
        
        return payments.stream()
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public OfferDto requestOffer(CreateOfferRequest request, UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Offer offer = new Offer();
        offer.setOfferNumber("OFF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        offer.setCustomer(customer);
        offer.setInsuranceType(request.getInsuranceType());

        // Handle agent if provided
        if (request.getAgentId() != null && !request.getAgentId().toString().trim().isEmpty()) {
            Agent agent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
            offer.setAgent(agent);
            log.info("Offer created with agent ID: {}", agent.getId());
        } else {
            log.warn("No agent ID provided in request, offer will have no agent assigned");
        }

        if (request.getCoverageIds() != null && !request.getCoverageIds().isEmpty()) {
            log.info("Received coverage IDs: {}", request.getCoverageIds());
            Set<Coverage> coverages = new HashSet<>(coverageRepository.findAllById(request.getCoverageIds()));
            log.info("Found {} coverages in database", coverages.size());
            offer.setCoverages(coverages);
            log.info("Setting {} coverages for offer: {}", coverages.size(), coverages.stream().map(Coverage::getName).collect(Collectors.joining(", ")));

            // Calculate premium based on selected coverages
            BigDecimal calculatedPremium = coverages.stream()
                    .map(Coverage::getBasePrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            offer.setTotalPremium(calculatedPremium);
            log.info("Calculated total premium: {} for offer with {} coverages", calculatedPremium, coverages.size());
        } else {
            log.info("No coverage IDs received in request");
            offer.setCoverages(new HashSet<>());
        }

        offer.setStatus(OfferStatus.PENDING);
        offer.setNote(request.getNote());
        offer.setCreatedAt(LocalDateTime.now());

        Offer saved = offerRepository.save(offer);
        Long offerId = saved.getId();

        // Handle dynamic insurance type details (request + service pattern)
        switch (request.getInsuranceType()) {
            case VEHICLE:
                if (request.getVehicleRequest() != null) {
                    var vehicleReq = request.getVehicleRequest();
                    vehicleReq.setCustomerId(customerId);
                    vehicleReq.setOfferId(offerId);
                    vehicleService.createVehicleFromRequest(vehicleReq, customerId, offerId);
                }
                break;
            case HEALTH:
                if (request.getHealthDetailRequest() != null) {
                    var healthReq = request.getHealthDetailRequest();
                    healthReq.setCustomerId(customerId);
                    healthReq.setOfferId(offerId);
                    healthInsuranceDetailService.create(healthReq);
                }
                break;
            case HOME:
                if (request.getHomeDetailRequest() != null) {
                    var homeReq = request.getHomeDetailRequest();
                    homeReq.setCustomerId(customerId);
                    homeReq.setOfferId(offerId);
                    homeInsuranceDetailService.create(homeReq);
                }
                break;
        }

        // Fetch the saved offer with all associations loaded to avoid lazy loading issues
        Offer offerWithDetails = offerRepository.findByIdWithDetails(saved.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Failed to retrieve saved offer"));
        return offerMapper.toDto(offerWithDetails);
    }
    



    @Override
    @Transactional(readOnly = true)
    public OfferDto getOfferById(Long offerId, UUID customerId) {
        Offer offer = offerRepository.findByIdWithDetails(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (!offer.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Offer not belong to this customer");
        }

        log.info("Offer {} loaded with {} coverages, createdAt: {}, customer: {}", 
                offerId, 
                offer.getCoverages() != null ? offer.getCoverages().size() : 0,
                offer.getCreatedAt(),
                offer.getCustomer().getUser().getFirstName() + " " + offer.getCustomer().getUser().getLastName());
        
        // Debug: Log coverage details
        if (offer.getCoverages() != null && !offer.getCoverages().isEmpty()) {
            log.info("Coverages found: {}", offer.getCoverages().stream()
                    .map(c -> c.getName() + " (ID: " + c.getId() + ")")
                    .collect(Collectors.joining(", ")));
        } else {
            log.warn("No coverages found for offer {}", offerId);
            // Additional debug: Check if offer has any coverages at all
            log.warn("Offer entity coverages field: {}", offer.getCoverages());
        }

        return offerMapper.toDto(offer);
    }


    @Override
    @Transactional
    public PolicyDto acceptOfferAndCreatePolicy(Long offerId, UUID customerId) {
        Offer offer = offerRepository.findByIdWithDetails(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        if (!offer.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You are not authorized to convert this offer");
        }
        if (offer.getStatus() != OfferStatus.APPROVED) {
            throw new InvalidRequestException("Only APPROVED offers can be converted to policy. Current status: " + offer.getStatus());
        }
        if (policyRepository.existsByOffer_Id(offer.getId())) {
            throw new InvalidRequestException("Policy already created for this offer");
        }

        Policy policy = new Policy();
        policy.setPolicyNumber("POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        policy.setCustomer(offer.getCustomer());
        policy.setAgent(offer.getAgent());
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setPremium(offer.getTotalPremium());
        policy.setInsuranceType(offer.getInsuranceType());
        policy.setOffer(offer); // yeni ilişki

        switch (offer.getInsuranceType()) {
            case VEHICLE -> policy.setVehicle(
                vehicleRepository.findByOfferId(offer.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle detail not found for offer"))
            );
            case HEALTH -> policy.setHealthInsuranceDetail(
                healthInsuranceDetailRepository.findByOfferId(offer.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Health insurance detail not found for offer"))
            );
            case HOME -> policy.setHomeInsuranceDetail(
                homeInsuranceDetailRepository.findByOfferId(offer.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Home insurance detail not found for offer"))
            );
            default -> throw new InvalidRequestException("Unsupported insurance type");
        }

        Policy savedPolicy = policyRepository.save(policy);

        offer.setStatus(OfferStatus.CONVERTED);
        offer.setConvertedAt(LocalDateTime.now());
        offer.setPolicy(savedPolicy);
        offerRepository.save(offer);

        return policyMapper.toDto(savedPolicy);
    }


    @Override
    @Transactional
    public ClaimDto createClaim(CreateClaimRequest request, UUID customerId) {

        // Poliçeyi bul ve doğrula
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + request.getPolicyId()));

        if (!policy.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Policy does not belong to this customer");
        }

        // Claim nesnesini oluştur
        Claim claim = new Claim();
        claim.setPolicy(policy);
        claim.setIncidentDate(request.getIncidentDate());
        claim.setDescription(request.getDescription());
        claim.setStatus(ClaimStatus.SUBMITTED);
        claim.setClaimNumber("CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        claim.setAgent(policy.getAgent());
        claim.setEstimatedAmount(request.getEstimatedAmount());
        claim.setNotificationsEnabled(request.isNotificationsEnabled());
        claim.setCreatedAt(LocalDateTime.now());

        // Önce claim'i kaydet
        Claim savedClaim = claimRepository.save(claim);

        return claimMapper.toDto(savedClaim);
    }

    @Transactional
    @Override
    public PaymentDto makePayment(Long policyId, CreatePaymentRequest request, UUID customerId) {

        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        if (!policy.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Policy does not belong to this customer");
        }

        List<Payment> existingPayments = paymentRepository.findByPolicy_Id(policyId);
        Payment payment;

        if (!existingPayments.isEmpty()) {
            payment = existingPayments.get(0); // tekrar findById gerek yok
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                throw new RuntimeException("A successful payment has already been made for this policy.");
            }
            if (payment.getStatus() == PaymentStatus.FAILED) {
                throw new RuntimeException("Payment for this policy has failed previously. Please try again.");
            }
            // existing -> createdAt dokunma
        } else {
            payment = new Payment();
            payment.setPolicy(policy);
            payment.setCustomer(policy.getCustomer());
            // ID’yi ELLE SET ETME! JPA üretsin.
            payment.setCreatedAt(LocalDateTime.now());
        }

        payment.setAmount(policy.getPremium());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionReference("TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        boolean ok = simulateCardPayment(request);
        payment.setStatus(ok ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setUpdatedAt(LocalDateTime.now());

        if (ok && policy.getStatus() != PolicyStatus.ACTIVE) {
            policy.setStatus(PolicyStatus.ACTIVE);
            policy.setUpdatedAt(LocalDateTime.now());
            policyRepository.save(policy);

            // OFFER STATUS GÜNCELLE
            Offer offer = policy.getOffer();
            if (offer != null && offer.getStatus() == OfferStatus.CONVERTED) {
                offer.setStatus(OfferStatus.PAID);
                offerRepository.save(offer);
            }
        }

        paymentRepository.save(payment);
        return paymentMapper.toDto(payment);
    }

    private boolean simulateCardPayment(CreatePaymentRequest request) {
        log.info("simulateCardPayment: Validating card details");
        log.info("simulateCardPayment: Card number: {}, Card holder: {}, Expiry: {}, CVV: {}", 
                request.getCardNumber(), request.getCardHolder(), request.getExpiryDate(), request.getCvv());
        
        boolean isValid = isNotBlank(request.getCardNumber()) &&
                isNotBlank(request.getCardHolder()) &&
                isNotBlank(request.getExpiryDate()) &&
                isNotBlank(request.getCvv());
        
        log.info("simulateCardPayment: Card validation result: {}", isValid);
        return isValid;
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
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
    public PaymentDto getPaymentById(UUID paymentId, UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);

        Payment payment = paymentRepository.findByIdAndPolicy_Customer_Id(paymentId, customerId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for customer: " + customerId));

        return paymentMapper.toDto(payment);
    }

    @Override
    public DocumentDto uploadDocument(MultipartFile file, UUID customerId, Long policyId, String claimId, String documentType, String description) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));

        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("Uploaded file is empty or filename is missing");
        }

        // Create DocumentDto with provided fields
        DocumentDto documentDto = new DocumentDto();
        documentDto.setCustomerId(customerId);
        documentDto.setDocumentType(DocumentType.valueOf(documentType != null ? documentType.toUpperCase() : "OTHER"));
        documentDto.setDescription(description);

        // Set policy and claim IDs if provided
        if (policyId != null) {
            documentDto.setPolicyId(policyId);
        }
        if (claimId != null) {
            documentDto.setClaimId(UUID.fromString(claimId));
        }
        
        // Use DocumentService for proper document handling
        return documentService.uploadDocument(documentDto, file);
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

        // Update common fields
        updateBaseCustomerFields(customer, request);

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
        // Mevcut müşteri kontrolü
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));

        // Tip kontrolü
        if (customer.getCustomerType() != CustomerType.CORPORATE) {
            throw new IllegalArgumentException("Customer is not a corporate customer");
        }

        // Ortak alanları güncelle (BaseCustomerRequest)
        updateBaseCustomerFields(customer, request);

        // Şirket bilgileri
        if (StringUtils.hasText(request.getCompanyName())) {
            customer.setCompanyName(request.getCompanyName());
        }

        if (StringUtils.hasText(request.getTaxNumber())) {
            boolean taxChanged = !request.getTaxNumber().equals(customer.getTaxNumber());
            boolean taxExists = customerRepository.existsByTaxNumber(request.getTaxNumber());

            if (taxChanged && taxExists) {
                throw new IllegalArgumentException("Tax number already exists: " + request.getTaxNumber());
            }

            customer.setTaxNumber(request.getTaxNumber());
        }

        if (StringUtils.hasText(request.getCompanyRegistrationNumber())) {
            customer.setCompanyRegistrationNumber(request.getCompanyRegistrationNumber());
        }

        customer.setUpdatedAt(LocalDateTime.now());

        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Corporate customer updated: {}", customerId);

        return customerMapper.toDto(updatedCustomer);
    }

    private void updateBaseCustomerFields(Customer customer, BaseCustomerRequest request) {
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




    }


    @Override
    public CustomerDto getCustomerById(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));

        return customerMapper.toDto(customer);
    }


    @Override
    @Transactional
    public void deleteCustomer(UUID customerId) {
        // Check if customer exists
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));

        // Business rule: Cannot delete customer with active policies
        List<Policy> activePolicies = policyRepository.findByCustomer_Id(customerId);
        boolean hasActivePolicies = activePolicies.stream()
                .anyMatch(policy -> "ACTIVE".equals(policy.getStatus().name()));

        if (hasActivePolicies) {
            throw new IllegalArgumentException("Cannot delete customer with active policies");
        }

        customerRepository.deleteById(customerId);
        log.info("Customer deleted successfully with id: {}", customerId);
    }

    @Override
    public CustomerDashboardDto getCustomerDashboard(UUID customerId) {
        CustomerDashboardDto dto = new CustomerDashboardDto();

        dto.setTotalPolicies(policyRepository.countByCustomer_Id(customerId));
        dto.setTotalClaims(claimRepository.countByPolicy_Customer_Id(customerId));
        dto.setTotalPayments(paymentRepository.countByPolicy_Customer_Id(customerId));
        dto.setTotalPremium(policyRepository.sumPremiumByCustomerId(customerId));

        return dto;
    }

    // Private validation methods
    private void validateCustomerExists(UUID customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomerNotFoundException("Customer not found with id: " + customerId);
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

    @Override
    public CustomerDto getCurrentCustomer() {
        try {
            log.info("getCurrentCustomer: Starting to get current customer");
            UUID currentUserId = null;
            
            try {
                currentUserId = SecurityUtils.getCurrentUserId();
    
            } catch (IllegalStateException e) {
                log.warn("getCurrentCustomer: Could not get user ID from SecurityUtils: {}", e.getMessage());
                
                // Try to get user ID from username
                String username = SecurityUtils.getCurrentUsername();

                
                // Find user by username/email
                User user = userRepository.findByEmail(username)
                        .or(() -> userRepository.findByUsername(username))
                        .orElseThrow(() -> new IllegalStateException("User not found for username: " + username));
                
                currentUserId = user.getId();

            }
            
            Customer customer = customerRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new CustomerNotFoundException("Customer not found for current user: " + SecurityUtils.getCurrentUserId()));
            
            log.info("getCurrentCustomer: Customer found: {}", customer.getId());
            CustomerDto customerDto = customerMapper.toDto(customer);
            log.info("getCurrentCustomer: Customer DTO created successfully");
            
            return customerDto;
        } catch (Exception e) {
            log.error("getCurrentCustomer: Error getting current customer: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<AgentDto> getAllAgents() {

        List<Agent> agents = agentRepository.findAll();
        if (agents.isEmpty()) {
            throw new ResourceNotFoundException("No agents found");
        }
        return agents.stream()
                .map(agentMapper::toDto)
                .collect(Collectors.toList());

    }
}
