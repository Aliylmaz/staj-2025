package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.CustomerDetailDto;
import com.ada.insurance_app.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {UserInfoMapper.class, VehicleMapper.class})
public interface CustomerDetailMapper {
    

    
    @Mapping(target = "firstName", source = "user.firstName")
    @Mapping(target = "lastName", source = "user.lastName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "phoneNumber", source = "user.phoneNumber")
    @Mapping(target = "vehicles", source = "vehicles")
    CustomerDetailDto toDto(Customer customer);
} 