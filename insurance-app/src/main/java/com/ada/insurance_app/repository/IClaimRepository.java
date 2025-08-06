package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.ClaimStatus;
import com.ada.insurance_app.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IClaimRepository extends JpaRepository<Claim, UUID> {

    Optional<Claim> findClaimByClaimNumber(String claimNumber);

    List<Claim> findClaimByPolicy_Id(Long policyİd);

    List<Claim> findByAgent_Id(UUID agentId);

    @Query("SELECT c FROM Claim c WHERE c.incidentDate BETWEEN :startDate AND :endDate")
    List<Claim> findByIncidentDateBetween(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("SELECT c FROM Claim c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<Claim> findClaimsBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(c.approvedAmount) FROM Claim c WHERE c.status = 'APPROVED' AND c.policy.id = :policyId")
    BigDecimal getTotalApprovedAmountByPolicy(@Param("policyId") Long policyId);

    @Query("SELECT c FROM Claim c WHERE " +
           "c.claimNumber LIKE %:keyword% OR " +
           "c.description LIKE %:keyword% OR " +
           "c.policy.policyNumber LIKE %:keyword%")
    List<Claim> searchClaims(@Param("keyword") String keyword);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.policy.id = :policyId AND c.status = :status")
    long countClaimsByPolicyAndStatus(
        @Param("policyId") Long policyId,
        @Param("status") ClaimStatus status
    );

    List<Claim> findByNotificationsEnabledAndStatus(boolean notificationsEnabled, ClaimStatus status);

    long countByStatus(ClaimStatus status);
    @Query("SELECT c FROM Claim c WHERE c.policy.customer.id = :customerId")
    List<Claim> findByCustomerId(UUID customerId);
    @Query("SELECT c FROM Claim c ORDER BY c.createdAt DESC")
    List<Claim> findTop5ByOrderByCreatedAtDesc();

    Optional<Claim> findByIdAndPolicy_Customer_Id(UUID claimId, UUID customerId);

    long countByPolicy_Agent_AgentNumber(String policyAgentAgentNumber);

    int countByPolicy_Customer_Id(UUID policyCustomerId);
}