package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.core.enums.OfferStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

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
    private Set<CoverageDto> coverages;
    private Long policyId;
    private AgentDto agent;
    private InsuranceType insuranceType;
    private String createdAt;
    private String updatedAt;
    private String acceptedAt;
    private String convertedAt;


}
