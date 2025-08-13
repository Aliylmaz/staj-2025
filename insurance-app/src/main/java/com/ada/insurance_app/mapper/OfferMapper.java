package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.entity.Offer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, CoverageMapper.class, PolicyMapper.class, AgentMapper.class})
public interface OfferMapper {

    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "coverages", source = "coverages")
    @Mapping(target="offerNumber", expression = "java(offer.getOfferNumber() != null ? offer.getOfferNumber() : \"\")")
    @Mapping(target = "policyId", expression = "java(offer.getPolicy() != null ? offer.getPolicy().getId() : null)")
    @Mapping(target = "createdAt", expression = "java(offer.getCreatedAt() != null ? offer.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(offer.getUpdatedAt() != null ? offer.getUpdatedAt().toString() : null)")
    @Mapping(target = "acceptedAt", expression = "java(offer.getAcceptedAt() != null ? offer.getAcceptedAt().toString() : null)")
    @Mapping(target = "convertedAt", expression = "java(offer.getConvertedAt() != null ? offer.getConvertedAt().toString() : null)")
    OfferDto toDto(Offer offer);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "coverages", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "acceptedAt", ignore = true)
    @Mapping(target = "convertedAt", ignore = true)
    @Mapping(target = "agent.createdAt", ignore = true)
    @Mapping(target = "agent.updatedAt", ignore = true)
    @Mapping(target = "agent.policies", ignore = true)
    @Mapping(target = "agent.user", ignore = true)
    Offer toEntity(OfferDto offerDto);
}

