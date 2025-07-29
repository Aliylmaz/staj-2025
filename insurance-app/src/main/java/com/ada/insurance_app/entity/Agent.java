package com.ada.insurance_app.entity;

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
@Table(name = "agents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String agentNumber;

    @Column
    private String name;

    @Column
    private String phoneNumber;

    @Column
    private String email;

    @OneToMany(mappedBy = "agent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Policy> policies = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to add a policy
    public void addPolicy(Policy policy) {
        policies.add(policy);
        policy.setAgent(this);
    }

    // Helper method to remove a policy
    public void removePolicy(Policy policy) {
        policies.remove(policy);
        policy.setAgent(null);
    }
} 