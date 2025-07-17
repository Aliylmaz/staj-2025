package com.ada.insurance_app.entity;

import com.ada.insurance_app.core.enums.CustomerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CustomerType customerType;

    @Column(nullable = false)
    private String customerNumber;

    // Fields for individual customers
    @Column
    private String nationalId;

    @Column
    private LocalDateTime dateOfBirth;

    // Fields for corporate customers
    @Column
    private String companyName;

    @Column
    private String taxNumber;

    @Column
    private String companyRegistrationNumber;

    @Column
    private String address;

    @Column
    private String city;

    @Column
    private String country;

    @Column
    private String postalCode;

    // Policy history tracking
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Policy> policies = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to add a policy
    public void addPolicy(Policy policy) {
        policies.add(policy);
        policy.setCustomer(this);
    }

    // Helper method to remove a policy
    public void removePolicy(Policy policy) {
        policies.remove(policy);
        policy.setCustomer(null);
    }
}