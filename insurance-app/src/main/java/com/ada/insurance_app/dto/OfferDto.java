package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfferDto {
    private Long id;
    private String offerNumber;
    private BigDecimal totalPremium;
    private OfferStatus status;
    private CustomerDto customer;
    private String note;
}
