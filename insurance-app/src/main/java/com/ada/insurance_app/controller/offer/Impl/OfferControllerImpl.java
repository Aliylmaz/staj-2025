package com.ada.insurance_app.controller.offer.Impl;

import com.ada.insurance_app.controller.offer.IOfferController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.request.offer.CreateOfferRequest;
import com.ada.insurance_app.request.offer.OfferUpdateRequest;
import com.ada.insurance_app.service.offer.IOfferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferControllerImpl implements IOfferController {

    private final IOfferService offerService;

    @Override
    @PostMapping("/request")
    public ResponseEntity<GeneralResponse<OfferDto>> requestOffer(@RequestBody CreateOfferRequest request) {
        try {
            log.info("Creating offer request");
            OfferDto offer = offerService.createOffer(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(GeneralResponse.success("Offer requested successfully", offer));
        } catch (Exception e) {
            log.error("Error creating offer request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to create offer request: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<GeneralResponse<List<OfferDto>>> getOffersByCustomer(@PathVariable UUID customerId) {
        try {
            log.info("Getting offers for customer: {}", customerId);
            List<OfferDto> offers = offerService.getOffersByCustomer(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Offers retrieved successfully", offers));
        } catch (Exception e) {
            log.error("Error getting offers for customer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offers: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @GetMapping("/{offerId}")
    public ResponseEntity<GeneralResponse<OfferDto>> getOfferById(@PathVariable Long offerId) {
        try {
            log.info("Getting offer by ID: {}", offerId);
            OfferDto offer = offerService.getOfferById(offerId);
            return ResponseEntity.ok(GeneralResponse.success("Offer retrieved successfully", offer));
        } catch (Exception e) {
            log.error("Error getting offer by ID: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offer: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @GetMapping
    public ResponseEntity<GeneralResponse<List<OfferDto>>> getAllOffers() {
        try {
            log.info("Getting all offers");
            List<OfferDto> offers = offerService.getAllOffers();
            return ResponseEntity.ok(GeneralResponse.success("All offers retrieved successfully", offers));
        } catch (Exception e) {
            log.error("Error getting all offers: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offers: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @PutMapping("/update-status")
    public ResponseEntity<GeneralResponse<OfferDto>> updateOfferStatus(@RequestBody OfferUpdateRequest request) {
        try {
            log.info("Updating offer status for offer ID: {}", request.getOfferId());
            OfferDto offer = offerService.updateOfferStatus(request);
            return ResponseEntity.ok(GeneralResponse.success("Offer status updated successfully", offer));
        } catch (Exception e) {
            log.error("Error updating offer status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to update offer status: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PutMapping("/{offerId}/approve")
    public ResponseEntity<GeneralResponse<OfferDto>> approveOffer(@PathVariable Long offerId, @RequestParam UUID agentId) {
        try {
            log.info("Agent {} approving offer: {}", agentId, offerId);
            OfferDto offer = offerService.approveOffer(offerId, agentId);
            return ResponseEntity.ok(GeneralResponse.success("Offer approved successfully", offer));
        } catch (Exception e) {
            log.error("Error approving offer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to approve offer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @PutMapping("/{offerId}/reject")
    public ResponseEntity<GeneralResponse<OfferDto>> rejectOffer(@PathVariable Long offerId, @RequestParam UUID agentId, @RequestParam String reason) {
        try {
            log.info("Agent {} rejecting offer: {} with reason: {}", agentId, offerId, reason);
            OfferDto offer = offerService.rejectOffer(offerId, agentId, reason);
            return ResponseEntity.ok(GeneralResponse.success("Offer rejected successfully", offer));
        } catch (Exception e) {
            log.error("Error rejecting offer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to reject offer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }

    @Override
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<GeneralResponse<List<OfferDto>>> getOffersByAgent(@PathVariable UUID agentId) {
        try {
            log.info("Getting offers for agent: {}", agentId);
            List<OfferDto> offers = offerService.getOffersByAgent(agentId);
            return ResponseEntity.ok(GeneralResponse.success("Offers retrieved successfully", offers));
        } catch (Exception e) {
            log.error("Error getting offers for agent: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get offers: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @Override
    @DeleteMapping("/{offerId}")
    public ResponseEntity<GeneralResponse<Void>> deleteOffer(@PathVariable Long offerId) {
        try {
            log.info("Deleting offer: {}", offerId);
            offerService.deleteOffer(offerId);
            return ResponseEntity.ok(GeneralResponse.success("Offer deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting offer: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(GeneralResponse.error("Failed to delete offer: " + e.getMessage(), HttpStatus.BAD_REQUEST));
        }
    }
} 