package com.ada.insurance_app.service.document.Impl;

import com.ada.insurance_app.core.exception.DocumentNotFoundException;
import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.entity.Document;
import com.ada.insurance_app.core.enums.DocumentType;
import com.ada.insurance_app.mapper.DocumentMapper;
import com.ada.insurance_app.repository.IDocumentRepository;
import com.ada.insurance_app.request.document.UploadDocumentRequest;
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
    private final DocumentMapper documentMapper;



    @Override
    public DocumentDto getDocumentById(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + documentId));
        return documentMapper.toDto(document);
    }

    @Override
    public List<DocumentDto> getDocumentsByPolicy(Long policyId) {
        List<Document> documents = documentRepository.findByPolicy_Id(policyId);
        return documents.stream().map(documentMapper::toDto).toList();
    }

    @Override
    public List<DocumentDto> getDocumentsByCustomer(UUID customerId) {
        List<Document> documents = documentRepository.findByCustomer_Id(customerId);
        return documents.stream().map(documentMapper::toDto).toList();
    }

    @Override
    public List<DocumentDto> getDocumentsByClaim(UUID claimId) {
        List<Document> documents = documentRepository.findByClaim_Id(claimId);
        return documents.stream().map(documentMapper::toDto).toList();
    }

    @Override
    public byte[] downloadDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + documentId));
        
        try {
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                throw new DocumentNotFoundException("File not found on disk: " + document.getFilePath());
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + document.getFilePath(), e);
        }
    }

    @Override
    @Transactional
    public DocumentDto uploadDocument(DocumentDto documentDto, MultipartFile file) {
        // Validasyon
        validateDocumentDto(documentDto);

        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("File size cannot exceed 10MB");
            }

            String contentType = file.getContentType();
            if (!isValidContentType(contentType)) {
                throw new IllegalArgumentException("Unsupported file type.");
            }

            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            String uploadDir = "uploads/" + documentDto.getDocumentType().toString().toLowerCase();
            String filePath = uploadDir + "/" + uniqueFileName;

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // DTO'yu entity'ye çevir ve güncelle
            documentDto.setFileName(uniqueFileName);
            documentDto.setOriginalFileName(file.getOriginalFilename());
            documentDto.setContentType(contentType);
            documentDto.setFileSize(file.getSize());
            documentDto.setFilePath(filePath);

            Document document = documentMapper.toEntity(documentDto);
            Document saved = documentRepository.save(document);
            return documentMapper.toDto(saved);

        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    private void validateDocumentDto(DocumentDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Document data cannot be null");
        }

        if (dto.getCustomerId() == null && dto.getPolicyId() == null && dto.getClaimId() == null) {
            throw new IllegalArgumentException("At least one relation (customer, policy or claim) must be provided.");
        }

        if (!StringUtils.hasText(dto.getDocumentType().name())) {
            throw new IllegalArgumentException("Document type is required");
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
    public DocumentDto getDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with id: " + documentId));
        return documentMapper.toDto(document);
    }




    @Override
    public List<DocumentDto> getDocumentsByType(DocumentType type) {
        if (type == null) {
            throw new IllegalArgumentException("Document type cannot be null");
        }

        List<Document> documents = documentRepository.findByDocumentType(type);
        return documents.stream().map(documentMapper::toDto).toList();
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
