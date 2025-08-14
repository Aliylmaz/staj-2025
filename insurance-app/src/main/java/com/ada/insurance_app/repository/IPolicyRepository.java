package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.core.enums.InsuranceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IPolicyRepository extends JpaRepository<Policy, Long> {

    List<Policy> findByCustomer_Id(UUID customerId);


    List<Policy> findByAgentId(UUID agentId);

    Optional<Policy> findByIdAndCustomerId(Long policyId, UUID customerId);
    
    @Query("SELECT p FROM Policy p JOIN p.coverages c WHERE c = :coverage")
    List<Policy> findByCoveragesContaining(com.ada.insurance_app.entity.Coverage coverage);

    @Query("SELECT COALESCE(SUM(p.premium), 0) FROM Policy p JOIN p.payment pay WHERE pay.status = 'SUCCESS'")
    double sumTotalPremium();

    long countPoliciesByAgent_AgentNumber(String agentAgentNumber);

    @Query("SELECT COALESCE(SUM(p.premium), 0) FROM Policy p JOIN p.payment pay WHERE p.agent.agentNumber = :agentNumber AND pay.status = 'SUCCESS'")
    double sumTotalPremiumByAgentNumber(@Param("agentNumber") String agentNumber);

    int countByCustomer_Id(UUID customerId);

    @Query("SELECT COALESCE(SUM(p.premium),0) FROM Policy p JOIN p.payment pay WHERE p.customer.id = :customerId AND pay.status = 'SUCCESS'")
    BigDecimal sumPremiumByCustomerId(UUID customerId);
    
    Long countByAgentId(UUID agentId);
    
    // Count approved policies by agent number
    @Query("SELECT COUNT(p) FROM Policy p WHERE p.agent.agentNumber = :agentNumber AND p.status = 'ACTIVE'")
    long countApprovedPoliciesByAgent_AgentNumber(@Param("agentNumber") String agentNumber);
}



