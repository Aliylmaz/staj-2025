package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.HealthInsuranceDetailDto;
import com.ada.insurance_app.entity.HealthInsuranceDetail;
import com.ada.insurance_app.request.health.CreateHealthInsuranceDetailRequest;
import com.ada.insurance_app.request.health.UpdateHealthInsuranceDetailRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HealthInsuranceDetailMapper {

    @Mapping(target = "customerId", source = "customer.id")
    HealthInsuranceDetailDto toDto(HealthInsuranceDetail entity);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HealthInsuranceDetail toEntity(HealthInsuranceDetailDto dto);

    // ✅ Eksik olan method – bunu mutlaka ekle
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HealthInsuranceDetail toEntity(CreateHealthInsuranceDetailRequest request);

    // ✅ Eksik olan update methodu
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "customer", ignore = true)
    void updateEntityFromRequest(@MappingTarget HealthInsuranceDetail entity, UpdateHealthInsuranceDetailRequest request);
}
