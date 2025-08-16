package com.ada.insurance_app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "home_insurance_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomeInsuranceDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private int buildingAge;

    @Column(nullable = false)
    private double squareMeters;

    @Column(nullable = false)
    private boolean earthquakeResistance;

    @Column(nullable = false)
    private Integer floorNumber; // Bulunduğu kat

    @Column(nullable = false)
    private Integer totalFloors; // Binanın toplam kat sayısı

    @OneToOne(mappedBy = "homeInsuranceDetail")
    private Policy policy;

    @OneToOne
    @JoinColumn(name = "offer_id", nullable = false, unique = true)
    private Offer offer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 