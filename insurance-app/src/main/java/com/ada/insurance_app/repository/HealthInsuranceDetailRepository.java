package com.ada.insurance_app.repository;

import com.ada.insurance_app.entity.HealthInsuranceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HealthInsuranceDetailRepository extends JpaRepository<HealthInsuranceDetail, UUID> {

    @Query("SELECT h FROM HealthInsuranceDetail h WHERE h.policy.id = :policyId")
    Optional<HealthInsuranceDetail> findByPolicyId(@Param("policyId") Long policyId);

    @Query("SELECT h FROM HealthInsuranceDetail h WHERE h.gender = :gender " +
           "AND h.dateOfBirth BETWEEN :startDate AND :endDate")
    List<HealthInsuranceDetail> searchByGenderAndDateRange(
            @Param("gender") String gender,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT h FROM HealthInsuranceDetail h WHERE " +
           "LOWER(h.medicalHistory) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<HealthInsuranceDetail> searchByMedicalHistory(@Param("keyword") String keyword);

    // En çok kullanılacak basit sorgular için method isimlendirme
    List<HealthInsuranceDetail> findByGender(String gender);
    List<HealthInsuranceDetail> findByDateOfBirthBefore(LocalDate date);
}