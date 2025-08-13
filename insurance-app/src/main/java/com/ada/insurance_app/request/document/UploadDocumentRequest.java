package com.ada.insurance_app.request.document;

import com.ada.insurance_app.core.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UploadDocumentRequest {

    @NotNull(message = "Policy ID must not be null")
    private Long policyId;

    @NotBlank(message = "Document type must not be blank")
    private DocumentType documentType;

    @NotNull(message = "File must not be null")
    private MultipartFile file;
}
