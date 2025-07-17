package com.ada.insurance_app.request.vehicle;

import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateVehicleRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

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
