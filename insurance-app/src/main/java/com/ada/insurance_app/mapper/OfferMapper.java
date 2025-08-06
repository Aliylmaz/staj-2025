package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.entity.Offer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, CoverageMapper.class})
public interface OfferMapper {
    

    
    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "coverages", source = "coverages")
    OfferDto toDto(Offer offer);
    
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "coverages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "acceptedAt", ignore = true)
    @Mapping(target = "convertedAt", ignore = true)
    Offer toEntity(OfferDto offerDto);
}
