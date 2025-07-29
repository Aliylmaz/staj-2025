package com.ada.insurance_app.dto;

import com.ada.insurance_app.core.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String filePath;
    private String description;
    private DocumentType documentType;
    private UUID customerId;
    private Long policyId;
    private UUID claimId;
}
