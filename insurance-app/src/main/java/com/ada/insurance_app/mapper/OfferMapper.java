package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.entity.Offer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, CoverageMapper.class, PolicyMapper.class, AgentMapper.class})
public interface OfferMapper {

    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "coverages", expression = "java(mapCoverages(offer.getCoverages()))")
    @Mapping(target="offerNumber", expression = "java(offer.getOfferNumber() != null ? offer.getOfferNumber() : \"\")")
    @Mapping(target = "policyId", expression = "java(offer.getPolicy() != null ? offer.getPolicy().getId() : null)")
    @Mapping(target = "createdAt", expression = "java(offer.getCreatedAt() != null ? offer.getCreatedAt().toString() : null)")
    @Mapping(target = "updatedAt", expression = "java(offer.getUpdatedAt() != null ? offer.getUpdatedAt().toString() : null)")
    @Mapping(target = "acceptedAt", expression = "java(offer.getAcceptedAt() != null ? offer.getAcceptedAt().toString() : null)")
    @Mapping(target = "convertedAt", expression = "java(offer.getConvertedAt() != null ? offer.getConvertedAt().toString() : null)")
    OfferDto toDto(Offer offer);

    // PRE-SIZE YOK, SNAPSHOT ÜZERİNDEN DÖN
    default java.util.Set<com.ada.insurance_app.dto.CoverageDto> mapCoverages(java.util.Set<com.ada.insurance_app.entity.Coverage> entities) {
        if (entities == null) return java.util.Collections.emptySet();
        java.util.Set<com.ada.insurance_app.dto.CoverageDto> out = new java.util.LinkedHashSet<>();
        // Snapshot: initialization bitmeden aynı koleksiyonda gezinmeyelim
        for (com.ada.insurance_app.entity.Coverage c : new java.util.ArrayList<>(entities)) {
            out.add(coverageToDto(c));
        }
        return out;
    }

    // CoverageMapper.toDto’yu çağırabilmek için bir köprü
    com.ada.insurance_app.dto.CoverageDto coverageToDto(com.ada.insurance_app.entity.Coverage coverage);

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

