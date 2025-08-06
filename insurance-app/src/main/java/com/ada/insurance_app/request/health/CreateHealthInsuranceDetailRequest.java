package com.ada.insurance_app.request.health;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateHealthInsuranceDetailRequest {
    private UUID CustomerId;
    private String dateOfBirth;
    private String gender;
    private String medicalHistory;
    private Double height;
    private Double weight;
    private Boolean smoker;
    private String chronicDiseases;
    private String currentMedications;
    private String allergies;
    private String familyMedicalHistory;
    private String bloodType;
}
