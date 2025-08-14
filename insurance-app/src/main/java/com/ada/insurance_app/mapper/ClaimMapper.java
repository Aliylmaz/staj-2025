package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.ClaimDto;
import com.ada.insurance_app.entity.Claim;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ClaimMapper {
    
    @Mapping(target = "policyId", source = "policy.id")
    @Mapping(target = "agentId", source = "agent.id")
    @Mapping(target = "agentName", source = "agent.name")
    ClaimDto toDto(Claim claim);
    
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "agent", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Claim toEntity(ClaimDto claimDto);
}
