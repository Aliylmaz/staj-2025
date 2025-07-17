package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VehicleDto {
    private UUID id;
    private String make;
    private String model;
    private Integer year;
    private String plateNumber;
    private String vin;
    private String engineNumber;
    private FuelType fuelType;
    private GearType gearType;
    private UsageType usageType;
    private Integer kilometers;
    private LocalDate registrationDate;
}
