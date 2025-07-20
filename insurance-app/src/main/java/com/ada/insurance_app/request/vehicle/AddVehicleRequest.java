package com.ada.insurance_app.request.vehicle;

import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AddVehicleRequest {

    @NotBlank
    private String make;

    @NotBlank
    private String model;

    @NotNull
    private Integer year;

    @NotBlank
    private String plateNumber;

    @NotBlank
    private String vin;

    @NotBlank
    private String engineNumber;

    private FuelType fuelType;

    private GearType gearType;

    private UsageType usageType;

    private Integer kilometers;

    private LocalDate registrationDate;

    @NotNull
    private UUID customerId;
}
