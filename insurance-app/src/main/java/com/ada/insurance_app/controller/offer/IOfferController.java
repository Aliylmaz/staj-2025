package com.ada.insurance_app.controller.offer;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

public interface IOfferController {

    // Offer request endpoint
    ResponseEntity<GeneralResponse<OfferDto>> requestOffer(CreateOfferRequest request);

    // Get offers by customer
    ResponseEntity<GeneralResponse<List<OfferDto>>> getOffersByCustomer(UUID customerId);

    // Get offer by ID
    ResponseEntity<GeneralResponse<OfferDto>> getOfferById(Long offerId);

    // Get all offers
    ResponseEntity<GeneralResponse<List<OfferDto>>> getAllOffers();

    // Update offer status (for agents)
    ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(OfferUpdateRequest request);

    // Agent approval endpoints
    ResponseEntity<GeneralResponse<OfferDto>> approveOffer(Long offerId, UUID agentId);
    ResponseEntity<GeneralResponse<OfferDto>> rejectOffer(Long offerId, UUID agentId, String reason);
    ResponseEntity<GeneralResponse<List<OfferDto>>> getOffersByAgent(UUID agentId);

    // Delete offer
    ResponseEntity<GeneralResponse<Void>> deleteOffer(Long offerId);
} 