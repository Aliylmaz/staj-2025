package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IAgentRepository extends JpaRepository<Agent, UUID> {

    Optional<Agent> findAgentByAgentNumber(String agentNumber);

    @Query("SELECT a FROM Agent a WHERE a.user.role = :role")
    List<Agent> findAllByUserRole(@Param("role") Role role);

    Optional<Agent> findByUser_Email(String email);



} 