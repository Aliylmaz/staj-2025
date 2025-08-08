package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Offer;
import com.ada.insurance_app.core.enums.OfferStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IOfferRepository extends JpaRepository<Offer, Long> {
    Optional<Offer> findByOfferNumber(String offerNumber);
    List<Offer> findByStatus(OfferStatus status);


        @EntityGraph(attributePaths = {"coverages", "customer", "policy"})
        List<Offer> findByCustomer_Id(UUID customerId);



    List<Offer> findByAgent_Id(UUID agentId);

    List<Offer> findByPolicy_Id(Long policyİd);
    @Query("SELECT o FROM Offer o WHERE o.customer.id = :customerId AND o.status = :status")
    List<Offer> findByCustomerIdAndStatus(UUID customerId, OfferStatus status);
    long countByStatus(OfferStatus status);
    @Query("SELECT o FROM Offer o ORDER BY o.createdAt DESC")
    List<Offer> findTop5ByOrderByCreatedAtDesc();
}