package com.ada.insurance_app.entity;

import com.ada.insurance_app.core.enums.InsuranceType;
import com.ada.insurance_app.core.enums.PolicyStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Offer> offers = new HashSet<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PolicyStatus status;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal premium;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InsuranceType insuranceType;
    @Column(length = 500)
    private  String  cancellationReason;


    @OneToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "health_detail_id")
    private HealthInsuranceDetail healthInsuranceDetail;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "home_detail_id")
    private HomeInsuranceDetail homeInsuranceDetail;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "policy_coverages",
            joinColumns = @JoinColumn(name = "policy_id"),
            inverseJoinColumns = @JoinColumn(name = "coverage_id")
    )
    private Set<Coverage> coverages = new HashSet<>();


    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Claim> claims = new HashSet<>();


    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Document> documents = new HashSet<>();


    @OneToOne(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private Payment payment;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper methods (coverages, claims, documents)
    public void addCoverage(Coverage coverage) {
        coverages.add(coverage);
        coverage.getPolicies().add(this);
    }

    public void removeCoverage(Coverage coverage) {
        coverages.remove(coverage);
        coverage.getPolicies().remove(this);
    }

    public void addClaim(Claim claim) {
        claims.add(claim);
        claim.setPolicy(this);
    }

    public void removeClaim(Claim claim) {
        claims.remove(claim);
        claim.setPolicy(null);
    }

    public void addDocument(Document document) {
        documents.add(document);
        document.setPolicy(this);
    }

    public void removeDocument(Document document) {
        documents.remove(document);
        document.setPolicy(null);
    }


}
