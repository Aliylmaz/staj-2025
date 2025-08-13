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


        // Handle dynamic insurance type details
        switch (request.getInsuranceType()) {
            case VEHICLE:
                if (request.getVehicleRequest() != null) {
                    Vehicle vehicle = new Vehicle();
                    vehicle.setMake(request.getVehicleRequest().getMake());
                    vehicle.setModel(request.getVehicleRequest().getModel());
                    vehicle.setYear(request.getVehicleRequest().getYear());
                    vehicle.setPlateNumber(request.getVehicleRequest().getPlateNumber());
                    vehicle.setVin(request.getVehicleRequest().getVin());
                    vehicle.setEngineNumber(request.getVehicleRequest().getEngineNumber());
                    vehicle.setFuelType(request.getVehicleRequest().getFuelType());
                    vehicle.setGearType(request.getVehicleRequest().getGearType());
                    vehicle.setUsageType(request.getVehicleRequest().getUsageType());
                    vehicle.setKilometers(request.getVehicleRequest().getKilometers());
                    if (request.getVehicleRequest().getRegistrationDate() != null && StringUtils.hasText(request.getVehicleRequest().getRegistrationDate())) {
                        vehicle.setRegistrationDate(LocalDate.parse(request.getVehicleRequest().getRegistrationDate()));
                    }
                    vehicle.setCustomer(customer);
                    vehicleRepository.save(vehicle);
                }
                break;
            case HEALTH:
                if (request.getHealthDetailRequest() != null) {
                    HealthInsuranceDetail healthDetail = new HealthInsuranceDetail();
                    if (request.getHealthDetailRequest().getDateOfBirth() != null && StringUtils.hasText(request.getHealthDetailRequest().getDateOfBirth())) {
                        healthDetail.setDateOfBirth(LocalDate.parse(request.getHealthDetailRequest().getDateOfBirth()));
                    }
                    healthDetail.setGender(request.getHealthDetailRequest().getGender());
                    healthDetail.setMedicalHistory(request.getHealthDetailRequest().getMedicalHistory());
                    healthDetail.setHeight(request.getHealthDetailRequest().getHeight());
                    healthDetail.setWeight(request.getHealthDetailRequest().getWeight());
                    healthDetail.setSmoker(request.getHealthDetailRequest().getSmoker());
                    healthDetail.setChronicDiseases(request.getHealthDetailRequest().getChronicDiseases());
                    healthDetail.setCurrentMedications(request.getHealthDetailRequest().getCurrentMedications());
                    healthDetail.setAllergies(request.getHealthDetailRequest().getAllergies());
                    healthDetail.setFamilyMedicalHistory(request.getHealthDetailRequest().getFamilyMedicalHistory());
                    healthDetail.setBloodType(request.getHealthDetailRequest().getBloodType());
                    healthDetail.setCustomer(customer);
                    healthInsuranceDetailRepository.save(healthDetail);
                }
                break;
            case HOME:
                if (request.getHomeDetailRequest() != null) {
                    HomeInsuranceDetail homeDetail = new HomeInsuranceDetail();
                    homeDetail.setAddress(request.getHomeDetailRequest().getAddress());
                    homeDetail.setBuildingAge(request.getHomeDetailRequest().getBuildingAge());
                    homeDetail.setSquareMeters(request.getHomeDetailRequest().getSquareMeters());
                    homeDetail.setEarthquakeResistance(request.getHomeDetailRequest().getEarthquakeResistance());
                    homeDetail.setFloorNumber(request.getHomeDetailRequest().getFloorNumber());
                    homeDetail.setTotalFloors(request.getHomeDetailRequest().getTotalFloors());
                    homeDetail.setCustomer(customer);
                    homeInsuranceDetailRepository.save(homeDetail);
                }
                break;
        }

        Offer saved = offerRepository.save(offer);
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
        // Teklifi getir
        Offer offer = offerRepository.findByIdWithDetails(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        // Debug logging for agent assignment
        log.info("=== Converting Offer to Policy ===");
        log.info("Offer ID: {}", offerId);
        log.info("Offer Status: {}", offer.getStatus());
        log.info("Offer Agent: {}", offer.getAgent() != null ? offer.getAgent().getId() : "NULL");
        if (offer.getAgent() != null) {
            log.info("Agent Name: {}", offer.getAgent().getName());
            log.info("Agent Email: {}", offer.getAgent().getEmail());
        }
        log.info("Customer ID: {}", offer.getCustomer().getId());
        log.info("Customer Name: {} {}", 
                offer.getCustomer().getUser() != null ? offer.getCustomer().getUser().getFirstName() : "null",
                offer.getCustomer().getUser() != null ? offer.getCustomer().getUser().getLastName() : "null");

        // Teklifi oluşturan müşteriyle şu anki müşteri aynı mı?
        if (!offer.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You are not authorized to convert this offer");
        }

        // Teklif sadece APPROVED durumunda mı?
        if (offer.getStatus() != OfferStatus.APPROVED) {
            throw new InvalidRequestException("Only APPROVED offers can be converted to policy. Current status: " + offer.getStatus());
        }

        // Yeni poliçe oluştur
        Policy policy = new Policy();
        policy.setPolicyNumber("POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        policy.setCustomer(offer.getCustomer());
        policy.setAgent(offer.getAgent()); // Agent'ı offer'dan al
        policy.setStatus(PolicyStatus.PENDING_PAYMENT); // Başlangıçta ödeme bekliyor
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1));
        policy.setPremium(offer.getTotalPremium());
        policy.setInsuranceType(offer.getInsuranceType());
        


        // Detayları InsuranceType'a göre ayarla
        switch (offer.getInsuranceType()) {
            case VEHICLE -> policy.setVehicle(
                    vehicleRepository.findByCustomerId(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found for customer"))
            );
            case HEALTH -> policy.setHealthInsuranceDetail(
                    healthInsuranceDetailRepository.findByCustomer_Id(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Health insurance detail not found for customer"))
            );
            case HOME -> policy.setHomeInsuranceDetail(
                    homeInsuranceDetailRepository.findByCustomer_Id(customerId)
                            .orElseThrow(() -> new ResourceNotFoundException("Home insurance detail not found for customer"))
            );
        }

        // Kaydet
        Policy savedPolicy = policyRepository.save(policy);


        // Teklifi CONVERTED durumuna güncelle
        offer.setStatus(OfferStatus.CONVERTED);
        offer.setConvertedAt(LocalDateTime.now());
        offer.setPolicy(savedPolicy);
        offerRepository.save(offer);


        
        PolicyDto policyDto = policyMapper.toDto(savedPolicy);
        return policyDto;
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

        Document document = new Document();
        document.setFilePath(request.getDocumentUrl());
        document.setCreatedAt(LocalDateTime.now());
        document.setPolicy(policy);

        Set<Document> documents = new HashSet<>();
        documents.add(document);

        claim.setDocuments(documents);


        // Kaydet
        claimRepository.save(claim);

        return claimMapper.toDto(claim);
    }

    @Override
    public PaymentDto makePayment(Long policyId, CreatePaymentRequest request, UUID customerId) {
        log.info("makePayment: Starting payment process for policy: {}, customer: {}", policyId, customerId);
        log.info("makePayment: Payment request details: {}", request);
        
        // Poliçeyi bul ve doğrula
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        if (!policy.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Policy does not belong to this customer");
        }

        log.info("makePayment: Policy found: {}, premium: {}", policy.getPolicyNumber(), policy.getPremium());

        // Check if payment already exists for this policy
        List<Payment> existingPayments = paymentRepository.findByPolicy_Id(policyId);
        Payment payment;
        
        if (!existingPayments.isEmpty()) {
            log.info("makePayment: Payment already exists for policy: {}, updating existing payment", policyId);
            payment = existingPayments.get(0); // Get the first (most recent) payment
            
            // Log existing payment details
            log.info("makePayment: Existing payment ID: {}, status: {}, amount: {}", 
                    payment.getId(), payment.getStatus(), payment.getAmount());
            
            // Check if there's already a successful payment - only prevent if SUCCESS
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.warn("makePayment: Policy {} already has a successful payment", policyId);
                throw new RuntimeException("A successful payment has already been made for this policy. No further payments are required.");
            }
            
            // If payment is FAILED, we can retry it
            if (payment.getStatus() == PaymentStatus.FAILED) {
                log.info("makePayment: Retrying failed payment for policy: {}", policyId);
            }
        } else {
            log.info("makePayment: Creating new payment for policy: {}", policyId);
            payment = new Payment();
            payment.setPolicy(policy);
            payment.setCustomer(policy.getCustomer());
            payment.setId(UUID.randomUUID()); // Generate new UUID for new payment
        }
        
        // Update payment details
        payment.setAmount(policy.getPremium());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionReference(UUID.randomUUID().toString());
        
        boolean paymentSuccess = simulateCardPayment(request);
        payment.setStatus(paymentSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        
        log.info("makePayment: Payment simulation result: {}, status: {}", paymentSuccess, payment.getStatus());

        if (payment.getStatus() == PaymentStatus.SUCCESS
                && policy.getStatus() != PolicyStatus.ACTIVE) {
            policy.setStatus(PolicyStatus.ACTIVE);
            policy.setUpdatedAt(LocalDateTime.now());
            policyRepository.save(policy);
            log.info("makePayment: Policy status updated to ACTIVE");
        }

        try {
            paymentRepository.save(payment);
            log.info("makePayment: Payment saved with ID: {}", payment.getId());
        } catch (Exception e) {
            log.error("makePayment: Error saving payment: {}", e.getMessage());
            if (e.getMessage().contains("duplicate key") || e.getMessage().contains("constraint")) {
                throw new RuntimeException("Payment already exists for this policy. Please contact support if you need to update payment details.");
            }
            throw e;
        }

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
    public DocumentDto uploadDocument(MultipartFile file, UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer not found with id: " + customerId));

        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("Uploaded file is empty or filename is missing");
        }

        // Create DocumentDto with required fields
        DocumentDto documentDto = new DocumentDto();
        documentDto.setCustomerId(customerId);
        documentDto.setDocumentType(DocumentType.OTHER); // Default document type
        documentDto.setDescription("Customer uploaded document");
        
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
                log.info("getCurrentCustomer: Current user ID from SecurityUtils: {}", currentUserId);
            } catch (IllegalStateException e) {
                log.warn("getCurrentCustomer: Could not get user ID from SecurityUtils: {}", e.getMessage());
                
                // Try to get user ID from username
                String username = SecurityUtils.getCurrentUsername();
                log.info("getCurrentCustomer: Getting user ID from username: {}", username);
                
                // Find user by username/email
                User user = userRepository.findByEmail(username)
                        .or(() -> userRepository.findByUsername(username))
                        .orElseThrow(() -> new IllegalStateException("User not found for username: " + username));
                
                currentUserId = user.getId();
                log.info("getCurrentCustomer: User ID found from username lookup: {}", currentUserId);
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
