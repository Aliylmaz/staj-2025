package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.CustomerDto;
import com.ada.insurance_app.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {UserInfoMapper.class})
public interface CustomerMapper {

    
    @Mapping(target = "user.firstName", source = "user.firstName")
    @Mapping(target = "user.lastName", source = "user.lastName")
    @Mapping(target = "user.email", source = "user.email")
    @Mapping(target = "user.phoneNumber", source = "user.phoneNumber")
    
    // Convenience fields mapping
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
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
