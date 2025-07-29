package com.ada.insurance_app.service.offer.Impl;

import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.core.exception.OfferAlreadyProcessedException;
import com.ada.insurance_app.core.exception.OfferNotFoundException;
import com.ada.insurance_app.entity.Offer;
import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.repository.IOfferRepository;
import com.ada.insurance_app.repository.IPolicyRepository;
import com.ada.insurance_app.service.offer.IOfferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements IOfferService {
    private final IOfferRepository offerRepository;
    private final IPolicyRepository policyRepository;

    @Override
    @Transactional
    public Offer createOffer(Offer offer) {
        // Validate offer data
        validateOffer(offer);
        
        // Set default status
        offer.setStatus(OfferStatus.PENDING);
        offer.setCreatedAt(LocalDateTime.now());
        
        Offer savedOffer = offerRepository.save(offer);
        log.info("Offer created successfully: {} for customer: {}", savedOffer.getId(), offer.getCustomer().getId());
        
        return savedOffer;
    }

    @Override
    @Transactional
    public Offer updateOffer(Long offerId, Offer offer) {
        // Validate offer data
        validateOffer(offer);

        // Check if offer exists
        Offer existing = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException("Offer not found with id: " + offerId));

        // Business rule: Cannot update processed offers
        if (existing.getStatus() != OfferStatus.PENDING) {
            throw new OfferAlreadyProcessedException("Cannot update offer that is already processed");
        }

        // Update offer fields
        existing.setOfferNumber(offer.getOfferNumber());
        existing.setPolicy(offer.getPolicy());
        existing.setTotalPremium(offer.getTotalPremium());
        existing.setStatus(offer.getStatus());
        existing.setCustomer(offer.getCustomer());
        existing.setNote(offer.getNote());

        Offer updatedOffer = offerRepository.save(existing);
        log.info("Offer updated successfully: {} with id: {}", updatedOffer.getId(), offerId);

        return updatedOffer;
    }

    @Override
    @Transactional
    public void deleteOffer(Long offerId) {
        // Check if offer exists
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException("Offer not found with id: " + offerId));
        
        // Business rule: Cannot delete accepted offers
        if (offer.getStatus() == OfferStatus.ACCEPTED) {
            throw new OfferAlreadyProcessedException("Cannot delete accepted offer");
        }
        
        offerRepository.deleteById(offerId);
        log.info("Offer deleted successfully with id: {}", offerId);
    }

    @Override
    public Offer getOffer(Long offerId) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException("Offer not found with id: " + offerId));
        
        return offer;
    }

    @Override
    public List<Offer> getOffersByCustomer(UUID customerId) {
        List<Offer> offers = offerRepository.findByCustomerId(customerId);
        return offers;
    }

    @Override
    public List<Offer> getOffersByPolicy(Long policyId) {
        // Check if policy exists
        if (!policyRepository.existsById(policyId)) {
            throw new IllegalArgumentException("Policy not found with id: " + policyId);
        }
        
        List<Offer> offers = offerRepository.findByPolicyId(policyId);
        return offers;
    }

    @Override
    public List<Offer> getOffersByStatus(OfferStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Offer status cannot be null");
        }
        
        List<Offer> offers = offerRepository.findByStatus(status);
        return offers;
    }

  @Override
  @Transactional
  public Offer approveOffer(Long offerId) {
      // Check if offer exists
      Offer offer = offerRepository.findById(offerId)
              .orElseThrow(() -> new OfferNotFoundException("Offer not found with id: " + offerId));

      // Business rule: Can only approve pending offers
      if (offer.getStatus() != OfferStatus.PENDING) {
          throw new OfferAlreadyProcessedException("Can only approve pending offers");
      }

      // Update offer status and set acceptance time
      offer.setStatus(OfferStatus.ACCEPTED);
      offer.setAcceptedAt(LocalDateTime.now());

      Offer approvedOffer = offerRepository.save(offer);
      log.info("Offer approved successfully: {} with id: {}", approvedOffer.getId(), offerId);

      return approvedOffer;
  }

    @Override
    @Transactional
    public Offer convertToPolicy(Long offerId) {
        // Check if offer exists
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException("Offer not found with id: " + offerId));

        // Business rule: Can only convert accepted offers
        if (offer.getStatus() != OfferStatus.ACCEPTED) {
            throw new OfferAlreadyProcessedException("Can only convert accepted offers to policies");
        }

        // Create new Policy from Offer
        Policy policy = new Policy();
        policy.setCustomer(offer.getCustomer());
        policy.setPremium(offer.getTotalPremium());
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(1)); // Varsayılan 1 yıllık poliçe
        policy.setCreatedAt(LocalDateTime.now());

        // Save the new policy
        Policy savedPolicy = policyRepository.save(policy);

        // Update offer with the new policy and status
        offer.setPolicy(savedPolicy);
        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setConvertedAt(LocalDateTime.now());

        Offer convertedOffer = offerRepository.save(offer);
        log.info("Offer converted to policy successfully: {} with id: {}", convertedOffer.getId(), offerId);

        return convertedOffer;
    }
    private void validateOffer(Offer offer) {
        if (offer == null) {
            throw new IllegalArgumentException("Offer data cannot be null");
        }

        if (offer.getCustomer() == null) {
            throw new IllegalArgumentException("Customer is required");
        }

        if (!StringUtils.hasText(offer.getOfferNumber())) {
            throw new IllegalArgumentException("Offer number is required");
        }

        if (offer.getTotalPremium() == null || offer.getTotalPremium().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Total premium must be greater than zero");
        }

        if (offer.getPolicy() == null) {
            throw new IllegalArgumentException("Policy is required");
        }

        if (offer.getStatus() == null) {
            throw new IllegalArgumentException("Offer status is required");
        }

        if (StringUtils.hasText(offer.getNote()) && offer.getNote().length() > 1000) {
            throw new IllegalArgumentException("Note cannot be longer than 1000 characters");
        }
    }
}
