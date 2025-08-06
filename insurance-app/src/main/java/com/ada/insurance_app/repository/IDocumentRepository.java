package com.ada.insurance_app.repository;

import com.ada.insurance_app.core.enums.DocumentType;
import com.ada.insurance_app.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IDocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDocumentType(DocumentType documentType);

    List<Document> findByPolicy_Id(Long policyİd);

    List<Document> findByClaim_Id(UUID claimId);

    List<Document> findByCustomer_Id(UUID customerİd);

    Optional<Document> findByFileName(String fileName);

    @Query("SELECT d FROM Document d WHERE d.policy.id = :policyId AND d.documentType = :documentType")
    List<Document> findByPolicyIdAndDocumentType(
        @Param("policyId") Long policyId,
        @Param("documentType") DocumentType documentType
    );

    @Query("SELECT d FROM Document d WHERE d.createdAt BETWEEN :startDate AND :endDate")
    List<Document> findDocumentsBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT d FROM Document d WHERE d.fileName LIKE %:keyword% OR " +
           "d.originalFileName LIKE %:keyword% OR d.description LIKE %:keyword%")
    List<Document> searchDocuments(@Param("keyword") String keyword);

    @Query("SELECT SUM(d.fileSize) FROM Document d WHERE d.policy.id = :policyId")
    Long getTotalFileSizeByPolicy(@Param("policyId") Long policyId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.customer.id = :customerId AND d.documentType = :documentType")
    long countDocumentsByCustomerAndType(
        @Param("customerId") UUID customerId,
        @Param("documentType") DocumentType documentType
    );

    @Query("SELECT d FROM Document d WHERE d.fileName LIKE %:keyword%")
    List<Document> searchByFileName(@Param("keyword") String keyword);

    Optional<Document> findByIdAndCustomerId(Long documentId, UUID customerId);
}