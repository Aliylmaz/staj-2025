package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.PolicyDto;
import com.ada.insurance_app.entity.Policy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {
    CustomerMapper.class,
    AgentMapper.class,
    VehicleMapper.class,
    CoverageMapper.class,
    PaymentMapper.class,
    HealthInsuranceDetailMapper.class,
    HomeInsuranceDetailMapper.class
})
public interface PolicyMapper {
    

    
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(policy.getCustomer() != null && policy.getCustomer().getUser() != null ? policy.getCustomer().getUser().getFirstName() + \" \" + policy.getCustomer().getUser().getLastName() : null)")
    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "vehicleDto", source = "vehicle")
    @Mapping(target = "vehicleDto.plateNumber", source = "vehicle.plateNumber")
    @Mapping(target = "agentId", source = "agent.id")
    @Mapping(target = "agentDto", source = "agent")
    @Mapping(target = "coverages", source = "coverages")
    @Mapping(target = "healthInsuranceDetail", source = "healthInsuranceDetail")
    @Mapping(target = "homeInsuranceDetail", source = "homeInsuranceDetail")
    PolicyDto toDto(Policy policy);
    
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "agent", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "coverages", ignore = true)
    @Mapping(target = "payment", ignore = true)
    @Mapping(target = "healthInsuranceDetail", source = "healthInsuranceDetail")
    @Mapping(target = "homeInsuranceDetail", source = "homeInsuranceDetail")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Policy toEntity(PolicyDto policyDto);
}