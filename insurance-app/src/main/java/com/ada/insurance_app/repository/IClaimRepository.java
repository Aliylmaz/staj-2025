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

    Optional<Claim> findByClaimNumber(String claimNumber);

    List<Claim> findByStatus(ClaimStatus status);

    List<Claim> findByPolicyId(Long policyId);

    @Query("SELECT c FROM Claim c WHERE c.policy.customer.id = :customerId")
    List<Claim> findByCustomerId(@Param("customerId") UUID customerId);

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
    BigDecimal getTotalApprovedAmountByPolicy(@Param("policyId") UUID policyId);

    @Query("SELECT c FROM Claim c WHERE " +
           "c.claimNumber LIKE %:keyword% OR " +
           "c.description LIKE %:keyword% OR " +
           "c.policy.policyNumber LIKE %:keyword%")
    List<Claim> searchClaims(@Param("keyword") String keyword);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.policy.id = :policyId AND c.status = :status")
    long countClaimsByPolicyAndStatus(
        @Param("policyId") UUID policyId,
        @Param("status") ClaimStatus status
    );

    List<Claim> findByNotificationsEnabledAndStatus(boolean notificationsEnabled, ClaimStatus status);
}