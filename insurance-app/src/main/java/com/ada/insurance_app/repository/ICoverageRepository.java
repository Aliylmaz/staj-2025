package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.Coverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ICoverageRepository extends JpaRepository<Coverage, Long> {

    Optional<Coverage> findByCode(String code);

    List<Coverage> findByActive(boolean active);

    boolean existsByCode(String code);

    @Query("SELECT c FROM Coverage c WHERE c.basePrice <= :maxPrice AND c.active = true")
    List<Coverage> findActiveCoveragesByMaxPrice(@Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT c FROM Coverage c WHERE c.name LIKE %:keyword% OR c.description LIKE %:keyword%")
    List<Coverage> searchCoverages(@Param("keyword") String keyword);

    @Query("SELECT c FROM Coverage c WHERE c.id IN (SELECT pc.id FROM Policy p JOIN p.coverages pc WHERE p.id = :policyId)")
    List<Coverage> findCoveragesByPolicyId(@Param("policyId") Long policyId);

    @Query("SELECT DISTINCT c FROM Coverage c JOIN c.policies p WHERE p.customer.id = :customerId")
    List<Coverage> findCoveragesByCustomerId(@Param("customerId") UUID customerId);

    @Query("SELECT COUNT(p) FROM Coverage c JOIN c.policies p WHERE c.id = :coverageId")
    long countPoliciesUsingCoverage(@Param("coverageId") Long coverageId);

    List<Coverage> findByNameContainingIgnoreCase(String name);
    List<Coverage> findByPolicies_Id(Long policyId);
    @Query("SELECT c FROM Coverage c ORDER BY c.createdAt DESC")
    List<Coverage> findTop5ByOrderByCreatedAtDesc();
    
    boolean existsByName(String name);


}
