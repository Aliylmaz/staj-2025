package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.InsuranceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverageDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal basePrice;
    private boolean active;
    private InsuranceType insuranceType; // Use String to avoid circular dependency issues
}
