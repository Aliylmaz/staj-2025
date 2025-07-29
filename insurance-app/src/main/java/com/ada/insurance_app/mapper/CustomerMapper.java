package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {UserInfoMapper.class})
public interface CustomerMapper {

    
    @Mapping(target = "user", source = "user")
    CustomerDto toDto(Customer entity);
    
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "vehicles", ignore = true)
    @Mapping(target = "homeInsuranceDetails", ignore = true)
    @Mapping(target = "healthInsuranceDetails", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CustomerDto customerDto);
}
