package com.ada.insurance_app.service.offer;

import com.ada.insurance_app.entity.Offer;
import com.ada.insurance_app.core.enums.OfferStatus;
import java.util.List;
import java.util.UUID;

public interface IOfferService {
    Offer createOffer(Offer offer);
    Offer updateOffer(Long offerId, Offer offer);
    void deleteOffer(Long offerId);
    Offer getOffer(Long offerId);
    List<Offer> getOffersByCustomer(UUID customerId);
    List<Offer> getOffersByPolicy(Long policyId);
    List<Offer> getOffersByStatus(OfferStatus status);
    Offer approveOffer(Long offerId);
    Offer convertToPolicy(Long offerId);
}
