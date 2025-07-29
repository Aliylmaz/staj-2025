package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.entity.Coverage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CoverageMapper {
    

    
    CoverageDto toDto(Coverage coverage);
    
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coverage toEntity(CoverageDto coverageDto);
}