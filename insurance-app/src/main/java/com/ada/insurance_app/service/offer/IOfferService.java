package com.ada.insurance_app.service.offer;

import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.entity.Offer;
import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import java.util.List;
import java.util.UUID;

public interface IOfferService {
    // DTO-based methods for controller
    OfferDto createOffer(CreateOfferRequest request);
    OfferDto updateOfferStatus(OfferUpdateRequest request);
    void deleteOffer(Long offerId);
    OfferDto getOfferById(Long offerId);
    List<OfferDto> getOffersByCustomer(UUID customerId);
    List<OfferDto> getAllOffers();
    
    // Agent approval methods
    OfferDto approveOffer(Long offerId, UUID agentId);
    OfferDto rejectOffer(Long offerId, UUID agentId, String reason);
    List<OfferDto> getOffersByAgent(UUID agentId);
    
    // Entity-based methods for internal use
    Offer createOffer(Offer offer);
    Offer updateOffer(Long offerId, Offer offer);
    Offer getOffer(Long offerId);
    List<Offer> getOffersByPolicy(Long policyId);
    List<Offer> getOffersByStatus(OfferStatus status);
    Offer approveOffer(Long offerId);
    Offer convertToPolicy(Long offerId);
}
