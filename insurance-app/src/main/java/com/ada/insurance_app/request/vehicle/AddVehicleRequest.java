package com.ada.insurance_app.request.vehicle;

import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AddVehicleRequest {

    private UUID customerId;


    @NotBlank(message = "Make is required")
    private String make;

    @NotBlank(message = "Model is required")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 1900, message = "Year must be >= 1900")
    @Max(value = 2030, message = "Year must be <= 2030")
    private Integer year;

    @NotBlank(message = "Plate number is required")
    // TR plaka (basit): 34ABC1234 gibi. İsterseniz TR harflerini de ekleyin.
    @Pattern(
            regexp = "^[0-9]{2}[A-ZÇĞİÖŞÜ]{1,3}[0-9]{2,4}$",
            message = "Invalid plate number format"
    )
    private String plateNumber;

    @NotBlank(message = "VIN is required")
    // VIN tam 17, I/O/Q içermez (opsiyonel ama yaygın kural)
    @Pattern(
            regexp = "^[A-HJ-NPR-Z0-9]{17}$",
            message = "VIN must be 17 chars (no I, O, Q)"
    )
    private String vin;

    @NotBlank(message = "Engine number is required")
    private String engineNumber;

    private FuelType fuelType;

    private GearType gearType;

    private UsageType usageType;

    private Integer kilometers;

    private String registrationDate;

    private Long offerId;

}
