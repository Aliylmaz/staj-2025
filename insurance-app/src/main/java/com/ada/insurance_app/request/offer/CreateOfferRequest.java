package com.ada.insurance_app.request.offer;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.vehicle.AddVehicleRequest;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOfferRequest {

    @NotNull(message = "Insurance type is required")
    private InsuranceType insuranceType;

    // Premium will be calculated on backend
    private BigDecimal totalPremium;

    private String note;

    // Selected coverage IDs for the offer
    private List<Long> coverageIds;

    // Agent who will handle this offer
    private UUID agentId;

    // Detaylar sadece seçilen insuranceType'a göre zorunlu olur
    private AddVehicleRequest vehicleRequest;
    private CreateHealthInsuranceDetailRequest healthDetailRequest;
    private CreateHomeInsuranceDetailRequest homeDetailRequest;
}
