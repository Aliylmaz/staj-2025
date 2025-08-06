package com.ada.insurance_app.service.document;

import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.entity.Document;
import com.ada.insurance_app.core.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IDocumentService {
    DocumentDto uploadDocument(DocumentDto document, MultipartFile file);
    void deleteDocument(Long documentId);
    DocumentDto getDocument(Long documentId);
    List<DocumentDto> getDocumentsByPolicy(Long policyId);
    List<DocumentDto> getDocumentsByCustomer(UUID customerId);
    List<DocumentDto> getDocumentsByClaim(UUID claimId);
    List<DocumentDto> getDocumentsByType(DocumentType type);
    DocumentDto getDocumentById(Long documentId);
    byte[] downloadDocument(Long documentId);
}
