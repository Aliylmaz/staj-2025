package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.PaymentDto;
import com.ada.insurance_app.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    

    
    PaymentDto toDto(Payment payment);
    
    @Mapping(target = "policy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Payment toEntity(PaymentDto paymentDto);
}