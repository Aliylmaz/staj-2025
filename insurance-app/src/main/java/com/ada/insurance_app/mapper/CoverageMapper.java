package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.CoverageDto;
import com.ada.insurance_app.entity.Coverage;
import com.ada.insurance_app.request.coverage.CreateCoverageRequest;
import com.ada.insurance_app.request.coverage.UpdateCoverageRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CoverageMapper {

    // Entity to DTO
    CoverageDto toDto(Coverage coverage);

    // DTO to Entity (sadece CoverageDto'dan çevirirken kullanılır)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "offers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coverage toEntity(CoverageDto coverageDto);

    // CreateRequest → Entity (Create işlemi için)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "offers", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Coverage toEntity(CreateCoverageRequest request);

    // Update işlemi için mevcut Entity'yi güncelleme
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "offers", ignore = true)
    void updateEntityFromRequest(@MappingTarget Coverage entity, UpdateCoverageRequest request);
}
