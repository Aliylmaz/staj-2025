package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.PolicyStatus;
import com.ada.insurance_app.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IPolicyRepository extends JpaRepository<Policy, Long> {

    Optional<Policy> findByPolicyNumber(String policyNumber);

    List<Policy> findByCustomerId(UUID customerId);

    List<Policy> findByVehicleId(UUID vehicleId);

    List<Policy> findByStatus(PolicyStatus status);

    @Query("SELECT p FROM Policy p WHERE p.endDate < :date AND p.status = 'ACTIVE'")
    List<Policy> findExpiredPolicies(@Param("date") LocalDate date);

    @Query("SELECT p FROM Policy p WHERE p.customer.id = :customerId AND p.status = 'ACTIVE'")
    List<Policy> findActivePolicesByCustomerId(@Param("customerId") UUID customerId);

    @Query("SELECT COUNT(p) > 0 FROM Policy p WHERE p.vehicle.id = :vehicleId AND p.status = 'ACTIVE'")
    boolean hasActivePolicy(@Param("vehicleId") UUID vehicleId);

    @Query("SELECT p FROM Policy p WHERE p.startDate BETWEEN :startDate AND :endDate")
    List<Policy> findPoliciesBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT p FROM Policy p WHERE p.customer.id = :customerId ORDER BY p.createdAt DESC")
    List<Policy> findCustomerPolicyHistory(@Param("customerId") UUID customerId);

    @Query("SELECT p FROM Policy p WHERE p.policyNumber LIKE %:keyword% OR " +
            "p.customer.user.firstName LIKE %:keyword% OR p.customer.user.lastName LIKE %:keyword%")
    List<Policy> searchPolicies(@Param("keyword") String keyword);

}



