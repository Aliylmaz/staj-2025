package com.ada.insurance_app.request.vehicle;

import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddVehicleRequest {

    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    private Integer year;

    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    @NotBlank(message = "VIN (chassis number) is required")
    private String vin;

    @NotBlank(message = "Engine number is required")
    private String engineNumber;

    @NotNull(message = "Fuel type is required")
    private FuelType fuelType;

    @NotNull(message = "Gear type is required")
    private GearType gearType;

    @NotNull(message = "Usage type is required")
    private UsageType usageType;

    private Integer kilometers;

    private LocalDate registrationDate;
}
