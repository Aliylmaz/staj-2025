package com.ada.insurance_app.request.offer;

import com.ada.insurance_app.core.enums.OfferStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OfferUpdateRequest {
    @NotNull(message = "Offer ID must not be null")
    private Long offerId;

    @NotNull(message = "Status must not be null")
    private OfferStatus status;

    private String note;
} 