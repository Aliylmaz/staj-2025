package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.VehicleDto;
import com.ada.insurance_app.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    
    @Mapping(target = "customerId", source = "customer.id")
    VehicleDto toDto(Vehicle vehicle);
    
    @Mapping(target = "customer", ignore = true)
    Vehicle toEntity(VehicleDto vehicleDto);
} 