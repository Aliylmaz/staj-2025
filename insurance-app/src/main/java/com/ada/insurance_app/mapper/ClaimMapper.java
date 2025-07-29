package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.entity.Claim;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ClaimMapper {
    

    
    @Mapping(target = "policyId", source = "policy.id")
    ClaimDto toDto(Claim claim);
    
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Claim toEntity(ClaimDto claimDto);
}
