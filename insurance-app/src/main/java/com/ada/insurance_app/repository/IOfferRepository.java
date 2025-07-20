package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.OfferStatus;
import com.ada.insurance_app.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IOfferRepository extends JpaRepository<Offer, Long> {

    Optional<Offer> findByOfferNumber(String offerNumber);

    List<Offer> findByStatus(OfferStatus status);

    List<Offer> findByCustomerId(UUID customerId);

    @Query("SELECT o FROM Offer o WHERE o.customer.id = :customerId AND o.status = :status")
    List<Offer> findByCustomerIdAndStatus(
        @Param("customerId") UUID customerId,
        @Param("status") OfferStatus status
    );

    @Query("SELECT o FROM Offer o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    List<Offer> findOffersBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT o FROM Offer o WHERE o.status = 'PENDING' AND o.createdAt < :expiryDate")
    List<Offer> findExpiredPendingOffers(@Param("expiryDate") LocalDateTime expiryDate);

    @Query("SELECT o FROM Offer o WHERE o.policy.id = :policyId")
    Optional<Offer> findByPolicyId(@Param("policyId") Long policyId);

    @Query("SELECT o FROM Offer o WHERE o.offerNumber LIKE %:keyword% OR " +
           "o.customer.user.firstName LIKE %:keyword% OR o.customer.user.lastName LIKE %:keyword%")
    List<Offer> searchOffers(@Param("keyword") String keyword);

    boolean existsByPolicyId(Long policyId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.customer.id = :customerId AND o.status = 'PENDING'")
    long countPendingOffersByCustomer(@Param("customerId") UUID customerId);
}