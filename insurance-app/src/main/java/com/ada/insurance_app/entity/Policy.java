package com.ada.insurance_app.entity;

import com.ada.insurance_app.enums.PolicyStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PolicyStatus status;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal premium;

    @Column
    private String vehicleMake;

    @Column
    private String vehicleModel;

    @Column
    private Integer vehicleYear;

    @Column
    private String vehiclePlateNumber;

    @Column
    private String vehicleIdentificationNumber;

    // Many-to-Many relationship with Coverage
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "policy_coverages",
        joinColumns = @JoinColumn(name = "policy_id"),
        inverseJoinColumns = @JoinColumn(name = "coverage_id")
    )
    private Set<Coverage> coverages = new HashSet<>();

    // One-to-Many relationship with Claim
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Claim> claims = new HashSet<>();

    // One-to-Many relationship with Document
    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documents = new HashSet<>();

    // One-to-One relationship with Offer
    @OneToOne(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Offer offer;

    // One-to-One relationship with Payment
    @OneToOne(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to add a coverage
    public void addCoverage(Coverage coverage) {
        coverages.add(coverage);
        coverage.getPolicies().add(this);
    }

    // Helper method to remove a coverage
    public void removeCoverage(Coverage coverage) {
        coverages.remove(coverage);
        coverage.getPolicies().remove(this);
    }

    // Helper method to add a claim
    public void addClaim(Claim claim) {
        claims.add(claim);
        claim.setPolicy(this);
    }

    // Helper method to remove a claim
    public void removeClaim(Claim claim) {
        claims.remove(claim);
        claim.setPolicy(null);
    }

    // Helper method to add a document
    public void addDocument(Document document) {
        documents.add(document);
        document.setPolicy(this);
    }

    // Helper method to remove a document
    public void removeDocument(Document document) {
        documents.remove(document);
        document.setPolicy(null);
    }
}