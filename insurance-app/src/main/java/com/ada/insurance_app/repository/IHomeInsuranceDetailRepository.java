package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.HomeInsuranceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IHomeInsuranceDetailRepository extends JpaRepository<HomeInsuranceDetail, UUID> {

    @Query("SELECT h FROM HomeInsuranceDetail h WHERE h.policy.id = :policyId")
    Optional<HomeInsuranceDetail> findByPolicyId(@Param("policyId") Long policyId);

    @Query("SELECT h FROM HomeInsuranceDetail h WHERE " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :address, '%')) " +
           "AND h.buildingAge <= :maxAge")
    List<HomeInsuranceDetail> searchByAddressAndMaxAge(
            @Param("address") String address,
            @Param("maxAge") int maxAge);

    @Query("SELECT h FROM HomeInsuranceDetail h WHERE " +
           "h.squareMeters >= :minSize AND h.earthquakeResistance = :isResistant")
    List<HomeInsuranceDetail> findBySquareMetersAndResistance(
            @Param("minSize") double minSize,
            @Param("isResistant") boolean isResistant);

    Optional<HomeInsuranceDetail> findByCustomer_Id(UUID customerİd);




}