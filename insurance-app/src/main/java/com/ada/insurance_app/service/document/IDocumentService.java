package com.ada.insurance_app.service.document;

import com.ada.insurance_app.entity.Document;
import com.ada.insurance_app.core.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IDocumentService {
    Document uploadDocument(Document document, MultipartFile file);
    void deleteDocument(Long documentId);
    Document getDocument(Long documentId);
    List<Document> getDocumentsByPolicy(Long policyId);
    List<Document> getDocumentsByCustomer(UUID customerId);
    List<Document> getDocumentsByClaim(UUID claimId);
    List<Document> getDocumentsByType(DocumentType type);
}
