package com.ada.insurance_app.controller.document.Impl;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.core.enums.DocumentType;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.service.document.IDocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentControllerImpl {

    private final IDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<GeneralResponse<DocumentDto>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "policyId", required = false) Long policyId,
            @RequestParam(value = "claimId", required = false) UUID claimId,
            @RequestParam(value = "customerId", required = false) UUID customerId,
            @RequestParam(value = "description", required = false) String description
    ) {
        log.info("Uploading document: {}, policyId: {}, claimId: {}, customerId: {}",
                file.getOriginalFilename(), policyId, claimId, customerId);

        try {
            // Smart validation based on document type
            if (documentType == DocumentType.POLICY_DOCUMENT && policyId == null) {
                return ResponseEntity.badRequest()
                        .body(GeneralResponse.error("Policy ID is required for POLICY_DOCUMENT", HttpStatus.BAD_REQUEST));
            }
            
            if (documentType == DocumentType.CLAIM_DOCUMENT) {
                if (policyId == null) {
                    return ResponseEntity.badRequest()
                            .body(GeneralResponse.error("Policy ID is required for CLAIM_DOCUMENT", HttpStatus.BAD_REQUEST));
                }
                // claimId is optional for CLAIM_DOCUMENT as it might be uploaded before claim creation
            }

            DocumentDto dto = new DocumentDto();
            dto.setPolicyId(policyId);
            dto.setClaimId(claimId);
            dto.setCustomerId(customerId);
            dto.setDocumentType(documentType);
            dto.setDescription(description);

            DocumentDto document = documentService.uploadDocument(dto, file);
            return ResponseEntity.ok(GeneralResponse.success("Document uploaded successfully", document));
        } catch (Exception e) {
            log.error("Error uploading document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to upload document: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<GeneralResponse<List<DocumentDto>>> getCustomerDocuments(
            @PathVariable UUID customerId) {

        log.info("Getting documents for customer: {}", customerId);

        try {
            List<DocumentDto> documents = documentService.getDocumentsByCustomer(customerId);
            return ResponseEntity.ok(GeneralResponse.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting customer documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get customer documents: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<GeneralResponse<List<DocumentDto>>> getClaimDocuments(
            @PathVariable UUID claimId) {

        log.info("Getting documents for claim: {}", claimId);

        try {
            List<DocumentDto> documents = documentService.getDocumentsByClaim(claimId);
            return ResponseEntity.ok(GeneralResponse.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting claim documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get claim documents: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<GeneralResponse<List<DocumentDto>>> getPolicyDocuments(
            @PathVariable Long policyId) {

        log.info("Getting documents for policy: {}", policyId);

        try {
            List<DocumentDto> documents = documentService.getDocumentsByPolicy(policyId);
            return ResponseEntity.ok(GeneralResponse.success("Documents retrieved successfully", documents));
        } catch (Exception e) {
            log.error("Error getting policy documents", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to get policy documents: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {

        log.info("Downloading document: {}", documentId);

        try {
            DocumentDto document = documentService.getDocumentById(documentId);
            byte[] fileContent = documentService.downloadDocument(documentId);
            
            return ResponseEntity.ok()
                    .header("Content-Type", document.getContentType())
                    .header("Content-Disposition", "attachment; filename=\"" + document.getFileName() + "\"")
                    .body(fileContent);
        } catch (Exception e) {
            log.error("Error downloading document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<GeneralResponse<Void>> deleteDocument(@PathVariable Long documentId) {
        try {
            documentService.deleteDocument(documentId);
            return ResponseEntity.ok(GeneralResponse.success("Document deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(GeneralResponse.error("Failed to delete document: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}