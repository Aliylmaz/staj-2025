package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.HomeInsuranceDetailDto;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import com.ada.insurance_app.request.home.UpdateHomeInsuranceDetailRequest;
import com.ada.insurance_app.entity.Customer;
import com.ada.insurance_app.entity.HomeInsuranceDetail;
import com.ada.insurance_app.request.home.CreateHomeInsuranceDetailRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HomeInsuranceDetailMapper {

    @Mapping(target = "customerId", source = "customer.id")
    HomeInsuranceDetailDto toDto(HomeInsuranceDetail homeInsuranceDetail);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HomeInsuranceDetail toEntity(HomeInsuranceDetailDto dto);

    // ✅ Yeni: Create için dönüşüm
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "customer", ignore = true) // UUID'den setlenecek
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HomeInsuranceDetail toEntity(CreateHomeInsuranceDetailRequest request);

    // ✅ Yeni: Update için mevcut entity'yi request'e göre güncelleme
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "customer", ignore = true) // UUID'den elle ayarlanır
    void updateEntityFromRequest(@MappingTarget HomeInsuranceDetail entity, UpdateHomeInsuranceDetailRequest request);
}
