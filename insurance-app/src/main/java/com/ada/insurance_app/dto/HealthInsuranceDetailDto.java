package com.ada.insurance_app.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class HealthInsuranceDetailDto {
    private UUID id;
    private LocalDate dateOfBirth;
    private String gender;
    private String medicalHistory;
    private UUID customerId;
    private Double height;
    private Double weight;
    private Boolean smoker;


} 