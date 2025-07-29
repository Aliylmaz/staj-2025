package com.ada.insurance_app.service.document.Impl;

import com.ada.insurance_app.core.exception.DocumentNotFoundException;
import com.ada.insurance_app.entity.Document;
import com.ada.insurance_app.core.enums.DocumentType;
import com.ada.insurance_app.repository.IDocumentRepository;
import com.ada.insurance_app.service.document.IDocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements IDocumentService {
    private final IDocumentRepository documentRepository;

@Override
@Transactional
public Document uploadDocument(Document document, MultipartFile file) {
    // Validate document data
    validateDocument(document);

    try {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (!isValidContentType(contentType)) {
            throw new IllegalArgumentException("Unsupported file type. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF");
        }

        // Generate unique filename and path
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String uploadDir = "uploads/" + document.getDocumentType().toString().toLowerCase();
        String filePath = uploadDir + "/" + uniqueFileName;

        // Create directories if they don't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file to storage
        Path targetPath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Update document metadata
        document.setFileName(uniqueFileName);
        document.setOriginalFileName(file.getOriginalFilename());
        document.setContentType(contentType);
        document.setFileSize(file.getSize());
        document.setFilePath(filePath);

        // Save document metadata to database
        Document savedDocument = documentRepository.save(document);
        log.info("Document uploaded successfully: {} for customer: {}",
                savedDocument.getId(),
                document.getCustomer() != null ? document.getCustomer().getId() : "no customer");

        return savedDocument;

    } catch (IOException ex) {
        throw new RuntimeException("Failed to store file", ex);
    }
}

private boolean isValidContentType(String contentType) {
    if (contentType == null) return false;

    List<String> validTypes = Arrays.asList(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "image/gif"
    );

    return validTypes.contains(contentType.toLowerCase());
}

   @Override
   @Transactional
   public void deleteDocument(Long documentId) {
       // Check if document exists
       Document document = documentRepository.findById(documentId)
               .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + documentId));

       try {
           // Get the file path and delete the physical file
           Path filePath = Paths.get(document.getFilePath());
           if (Files.exists(filePath)) {
               Files.delete(filePath);

               // Delete the parent directory if empty
               Path parentDir = filePath.getParent();
               if (Files.exists(parentDir) && isDirEmpty(parentDir)) {
                   Files.delete(parentDir);
               }
           }

           // Delete document record from database
           documentRepository.deleteById(documentId);
           log.info("Document deleted successfully with id: {}", documentId);

       } catch (IOException ex) {
           throw new RuntimeException("Failed to delete file: " + document.getFilePath(), ex);
       }
   }

   private boolean isDirEmpty(Path path) throws IOException {
       try (var entries = Files.list(path)) {
           return !entries.findFirst().isPresent();
       }
   }

    @Override
    public Document getDocument(Long documentId) {

        return documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + documentId));
    }

    @Override
    public List<Document> getDocumentsByPolicy(Long policyId) {
        return documentRepository.findByPolicyId(policyId);
    }

    @Override
    public List<Document> getDocumentsByCustomer(UUID customerId) {
        return documentRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Document> getDocumentsByClaim(UUID claimId) {
        return documentRepository.findByClaimId(claimId);
    }

    @Override
    public List<Document> getDocumentsByType(DocumentType type) {
        if (type == null) {
            throw new IllegalArgumentException("Document type cannot be null");
        }
        
        List<Document> documents = documentRepository.findByDocumentType(type);
        return documents;
    }

    private void validateDocument(Document document) {
        if (document == null) {
            throw new IllegalArgumentException("Document data cannot be null");
        }

        if (document.getCustomer() == null) {
            throw new IllegalArgumentException("Customer is required");
        }

        if (!StringUtils.hasText(document.getOriginalFileName())) {
            throw new IllegalArgumentException("Original file name is required");
        }

        if (!StringUtils.hasText(document.getContentType())) {
            throw new IllegalArgumentException("Content type is required");
        }

        if (document.getFileSize() == null || document.getFileSize() <= 0) {
            throw new IllegalArgumentException("File size must be greater than zero");
        }

        if (document.getFileSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        if (document.getDocumentType() == null) {
            throw new IllegalArgumentException("Document type is required");
        }

        // Validate content type
        String contentType = document.getContentType().toLowerCase();
        if (!isValidContentType(contentType)) {
            throw new IllegalArgumentException("Unsupported file type. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF");
        }
    }
}
