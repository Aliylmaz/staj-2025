package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.entity.Agent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AgentMapper {
    
    AgentMapper INSTANCE = Mappers.getMapper(AgentMapper.class);
    
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "surname", source = "user.lastName")
    @Mapping(target = "policyIds", expression = "java(mapPolicyIds(agent))")
    
    // Agent specific fields

    @Mapping(target = "name", source = "user.firstName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "phoneNumber", source = "phoneNumber")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "city", source = "city")
    @Mapping(target = "country", source = "country")
    @Mapping(target = "postalCode", source = "postalCode")
    AgentDto toDto(Agent agent);
    
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "policies", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Agent toEntity(AgentDto agentDto);
    
    default List<Long> mapPolicyIds(Agent agent) {
        if (agent == null || agent.getPolicies() == null) {
            return null;
        }
        return agent.getPolicies().stream()
                .map(policy -> policy.getId())
                .collect(Collectors.toList());
    }
} 