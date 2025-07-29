package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AgentRepository extends JpaRepository<Agent, UUID> {
    // Ek sorgular gerekirse buraya eklenebilir
} 