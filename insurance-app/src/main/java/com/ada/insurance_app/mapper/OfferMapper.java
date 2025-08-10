package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.OfferDto;
import com.ada.insurance_app.entity.Offer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, CoverageMapper.class, AgentMapper.class})
public interface OfferMapper {

    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "coverages", expression = "java(mapCoverages(offer.getCoverages()))")
    @Mapping(target="offerNumber", expression = "java(offer.getOfferNumber() != null ? offer.getOfferNumber() : \"\")")
    @Mapping(target = "policyId", expression = "java(offer.getPolicy() != null ? offer.getPolicy().getId() : null)")
    @Mapping(target = "agent", source = "agent")
    @Mapping(target = "insuranceType", source = "insuranceType")
    OfferDto toDto(Offer offer);

    // PRE-SIZE YOK, SNAPSHOT ÜZERİNDEN DÖN
    default java.util.Set<com.ada.insurance_app.dto.CoverageDto> mapCoverages(java.util.Set<com.ada.insurance_app.entity.Coverage> entities) {
        if (entities == null) return java.util.Collections.emptySet();
        
        // Create a new set to avoid concurrent modification issues
        java.util.Set<com.ada.insurance_app.dto.CoverageDto> out = new java.util.LinkedHashSet<>();
        
        // Use iterator to safely iterate over the collection
        for (com.ada.insurance_app.entity.Coverage c : entities) {
            if (c != null) {
                out.add(coverageToDto(c));
            }
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
    @Mapping(target = "agent", ignore = true)
    @Mapping(target = "offerNumber", ignore = true)
    @Mapping(target = "insuranceType", ignore = true)

    Offer toEntity(OfferDto offerDto);
}

