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

import static com.ada.insurance_app.core.enums.InsuranceType.*;
import com.ada.insurance_app.repository.IAgentRepository;

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
    private final IPaymentRepository PaymentRepository;
    private final ICoverageRepository coverageRepository;
    private final IAgentRepository agentRepository;
    private final PolicyMapper policyMapper;
    private final DocumentMapper documentMapper;
    private final ClaimMapper claimMapper;
    private final CustomerMapper customerMapper;
    private final OfferMapper OfferMapper;
    private final PaymentMapper paymentMapper;
    private final IUserRepository userRepository;

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

    @Override
    public List<OfferDto> getMyOffers(UUID customerId) {
        // Validate customer exists
        validateCustomerExists(customerId);

        // Fetch offers directly by customer ID
        List<Offer> offers = offerRepository.findByCustomer_Id(customerId);
        return offers.stream()
                .map(OfferMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentDto> getMyPayments(UUID customerId) {
        validateCustomerExists(customerId);
        List<Policy> policies = policyRepository.findByCustomer_Id(customerId);

        return policies.stream()
                .map(Policy::getPayment)
                .filter(Objects::nonNull)
                .map(paymentMapper::toDto)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public OfferDto requestOffer(CreateOfferRequest request, UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Offer offer = new Offer();
        offer.setOfferNumber(UUID.randomUUID().toString());
        offer.setCustomer(customer);
        offer.setInsuranceType(request.getInsuranceType());
        
        // Handle agent if provided
        if (request.getAgentId() != null) {
            Agent agent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Agent not found"));
            offer.setAgent(agent);
        }
        
        // Handle coverages if provided
        if (request.getCoverageIds() != null && !request.getCoverageIds().isEmpty()) {
            Set<Coverage> coverages = new HashSet<>(coverageRepository.findAllById(request.getCoverageIds()));
            offer.setCoverages(coverages);
            
            // Calculate premium based on selected coverages
            BigDecimal calculatedPremium = coverages.stream()
                    .map(Coverage::getBasePrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            offer.setTotalPremium(calculatedPremium);
        } else {
            // Fallback to insurance type based calculation
            BigDecimal calculatedPremium = calculatePremium(request);
            offer.setTotalPremium(calculatedPremium);
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
        return OfferMapper.toDto(saved);
    }
    
    private BigDecimal calculatePremium(CreateOfferRequest request) {
        // Base premium calculation logic
        BigDecimal basePremium = new BigDecimal("1000.00"); // Base premium
        
        switch (request.getInsuranceType()) {
            case VEHICLE:
                // Vehicle insurance premium calculation
                return basePremium.multiply(new BigDecimal("1.5"));
            case HEALTH:
                // Health insurance premium calculation
                return basePremium.multiply(new BigDecimal("2.0"));
            case HOME:
                // Home insurance premium calculation
                return basePremium.multiply(new BigDecimal("1.8"));
            default:
                return basePremium;
        }
    }


    @Override
    public OfferDto getOfferById(Long offerId, UUID customerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        if (!offer.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Offer does not belong to this customer");
        }

        return OfferMapper.toDto(offer);
    }


    @Override
    @Transactional
    public PolicyDto acceptOfferAndCreatePolicy(Long offerId, UUID customerId) {
        // Teklifi getir
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found with ID: " + offerId));

        // Teklifi oluşturan müşteriyle şu anki müşteri aynı mı?
        if (!offer.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("You are not authorized to accept this offer");
        }

        // Teklif zaten işlenmiş mi?
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new InvalidRequestException("Offer is already processed");
        }

        // Teklifi kabul et
        offer.setStatus(OfferStatus.APPROVED);
        offer.setAcceptedAt(LocalDateTime.now());

        // Yeni poliçe oluştur
        Policy policy = new Policy();
        policy.setPolicyNumber(UUID.randomUUID().toString());
        policy.setCustomer(offer.getCustomer());
        policy.setStatus(PolicyStatus.ACTIVE);
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
        policyRepository.save(policy);

        // Teklifle poliçeyi bağla
        offer.setConvertedAt(LocalDateTime.now());
        offer.setPolicy(policy);
        offerRepository.save(offer);

        return policyMapper.toDto(policy);
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
        // Poliçeyi bul ve doğrula
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found with ID: " + policyId));

        if (!policy.getCustomer().getId().equals(customerId)) {
            throw new UnauthorizedAccessException("Policy does not belong to this customer");
        }


        Payment payment = new Payment();
        payment.setPolicy(policy);
        payment.setCustomer(policy.getCustomer());
        payment.setAmount(policy.getPremium());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionReference(UUID.randomUUID().toString());
        payment.setStatus(simulateCardPayment(request) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setCreatedAt(LocalDateTime.now());

        if (payment.getStatus() == PaymentStatus.SUCCESS
                && policy.getStatus() != PolicyStatus.ACTIVE) {
            policy.setStatus(PolicyStatus.ACTIVE);
            policy.setUpdatedAt(LocalDateTime.now());
            policyRepository.save(policy);
        }



        PaymentRepository.save(payment);

        return paymentMapper.toDto(payment);

    }

    private boolean simulateCardPayment(CreatePaymentRequest request) {
        return isNotBlank(request.getCardNumber()) &&
                isNotBlank(request.getCardHolder()) &&
                isNotBlank(request.getExpiryDate()) &&
                isNotBlank(request.getCvv());
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

        Payment payment = PaymentRepository.findByIdAndPolicy_Customer_Id(paymentId, customerId)
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


        Document document = new Document();
        document.setFilePath(file.getOriginalFilename());
        document.setCustomer(customer);
        document.setCreatedAt(LocalDateTime.now());


        Document savedDocument = documentRepository.save(document);
        log.info("Document uploaded successfully for customer: {}", customerId);

        return documentMapper.toDto(savedDocument);
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
        dto.setTotalPayments(PaymentRepository.countByPolicy_Customer_Id(customerId));
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
}
