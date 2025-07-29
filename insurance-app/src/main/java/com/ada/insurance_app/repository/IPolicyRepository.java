package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Policy;
import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.core.enums.InsuranceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IPolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findByPolicyNumber(String policyNumber);
    List<Policy> findByCustomerId(UUID customerId);
    List<Policy> findByStatus(PolicyStatus status);
    List<Policy> findByInsuranceType(InsuranceType insuranceType);
    @Query("SELECT p FROM Policy p WHERE p.customer.id = :customerId AND p.insuranceType = :insuranceType")
    List<Policy> findByCustomerIdAndInsuranceType(UUID customerId, InsuranceType insuranceType);
    long countByStatus(PolicyStatus status);
    long countByInsuranceType(InsuranceType insuranceType);
    @Query("SELECT p FROM Policy p WHERE p.startDate BETWEEN :startDate AND :endDate")
    List<Policy> findPoliciesBetweenDates(LocalDate startDate, LocalDate endDate);
    @Query("SELECT p FROM Policy p ORDER BY p.createdAt DESC")
    List<Policy> findTop5ByOrderByCreatedAtDesc();
    List<Policy> findByAgentId(UUID agentId);

    Optional<Policy> findByIdAndCustomerId(Long policyId, UUID customerId);
    
    @Query("SELECT p FROM Policy p JOIN p.coverages c WHERE c = :coverage")
    List<Policy> findByCoveragesContaining(com.ada.insurance_app.entity.Coverage coverage);

    @Query("SELECT COALESCE(SUM(p.premium), 0) FROM Policy p")
    double sumTotalPremium();
}



