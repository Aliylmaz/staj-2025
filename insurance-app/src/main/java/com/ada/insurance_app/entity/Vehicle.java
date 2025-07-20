package com.ada.insurance_app.entity;


import com.ada.insurance_app.core.enums.FuelType;
import com.ada.insurance_app.core.enums.GearType;
import com.ada.insurance_app.core.enums.UsageType;
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
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String make; // Marka

    @Column(nullable = false)
    private String model; // Model

    @Column(nullable = false)
    private Integer year; // Üretim yılı

    @Column(nullable = false, unique = true)
    private String plateNumber; // Plaka

    @Column(nullable = false, unique = true)
    private String vin; // Şasi No

    @Column(nullable = false, unique = true)
    private String engineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    private GearType gearType;

    @Enumerated(EnumType.STRING)
    private UsageType usageType;

    private Integer kilometers; // Opsiyonel

    private LocalDate registrationDate; // Trafiğe çıkış tarihi

    @OneToOne(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private Policy policy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
