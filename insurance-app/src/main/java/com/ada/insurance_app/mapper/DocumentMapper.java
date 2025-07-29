package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.DocumentDto;
import com.ada.insurance_app.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.stereotype.Service;

@Service
@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "policyId", source = "policy.id")
    @Mapping(target = "claimId", source = "claim.id")
    DocumentDto toDto(Document document);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "claim", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Document toEntity(DocumentDto documentDto);
}
