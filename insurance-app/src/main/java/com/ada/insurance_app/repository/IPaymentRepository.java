package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.PaymentStatus;
import com.ada.insurance_app.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByPolicyId(Long policyId);

    Optional<Payment> findByTransactionReference(String transactionReference);

    @Query("SELECT p FROM Payment p WHERE p.policy.id = :policyId ORDER BY p.createdAt DESC")
    List<Payment> findPolicyPaymentHistory(@Param("policyId") Long policyId);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> findPaymentsBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND p.policy.id = :policyId")
    BigDecimal getTotalSuccessfulPaymentsByPolicy(@Param("policyId") Long policyId);

    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :timeout")
    List<Payment> findTimedOutPayments(@Param("timeout") LocalDateTime timeout);

    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.policy.id = :policyId AND p.status = 'SUCCESS'")
    boolean hasSuccessfulPayment(@Param("policyId") Long policyId);

    @Query("SELECT p FROM Payment p WHERE " +
           "p.transactionReference LIKE %:keyword% OR " +
           "p.policy.policyNumber LIKE %:keyword%")
    List<Payment> searchPayments(@Param("keyword") String keyword);

    long countByStatus(PaymentStatus status);
    @Query("SELECT p FROM Payment p ORDER BY p.createdAt DESC")
    List<Payment> findTop5ByOrderByCreatedAtDesc();
}