package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.PaymentDto;
import com.ada.insurance_app.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    
    @Mapping(source = "policy.policyNumber", target = "policyNumber")
    @Mapping(source = "policy.insuranceType", target = "insuranceType")
    @Mapping(expression = "java(payment.getCustomer().getUser().getFirstName() + \" \" + payment.getCustomer().getUser().getLastName())", target = "customerName")
    @Mapping(source = "createdAt", target = "createdAt")
    PaymentDto toDto(Payment payment);
    

    @Mapping(target = "createdAt", ignore = true)
    Payment toEntity(PaymentDto paymentDto);
}