package com.ada.insurance_app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "health_insurance_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthInsuranceDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 10)
    private String gender;

    @Column(length = 1000)
    private String medicalHistory;

    @Column(nullable = false)
    private Double height; // cm cinsinden

    @Column(nullable = false)
    private Double weight; // kg cinsinden

    @Column(nullable = false)
    private Boolean smoker;

    @Column(length = 500)
    private String chronicDiseases;

    @Column(length = 500)
    private String currentMedications;

    @Column(length = 500)
    private String allergies;

    @Column(length = 500)
    private String familyMedicalHistory;

    @Column(nullable = false)
    private String bloodType;

    @OneToOne(mappedBy = "healthInsuranceDetail")
    private Policy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}