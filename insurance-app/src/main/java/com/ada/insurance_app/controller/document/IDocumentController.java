package com.ada.insurance_app.controller.document;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.request.document.UploadDocumentRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IDocumentController {

    // Document upload endpoint
    ResponseEntity<GeneralResponse<DocumentDto>> uploadDocument(MultipartFile file, UploadDocumentRequest request);

    // Get documents by policy
    ResponseEntity<GeneralResponse<List<DocumentDto>>> getDocumentsByPolicy(Long policyId);

    // Get documents by claim
    ResponseEntity<GeneralResponse<List<DocumentDto>>> getDocumentsByClaim(UUID claimId);

    // Get documents by customer
    ResponseEntity<GeneralResponse<List<DocumentDto>>> getDocumentsByCustomer(UUID customerId);

    // Get document by ID
    ResponseEntity<GeneralResponse<DocumentDto>> getDocumentById(Long documentId);

    // Delete document
    ResponseEntity<GeneralResponse<Void>> deleteDocument(Long documentId);

    // Download document
    ResponseEntity<byte[]> downloadDocument(Long documentId);
} 