package com.ada.insurance_app.service.user.helper;

import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.repository.IAgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Helper class for Agent-related operations following Single Responsibility Principle
 */
@Component
@RequiredArgsConstructor
public class AgentServiceHelper {
    
    private final IAgentRepository agentRepository;
    
    /**
     * Get current authenticated agent from security context
     * @return Current agent
     * @throws RuntimeException if agent not found
     */
    public Agent getCurrentAuthenticatedAgent() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        return agentRepository.findByUsernameOrEmail(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current agent not found with username/email: " + currentUsername));
    }
    
    /**
     * Get agent by ID with existence validation
     * @param agentId Agent ID
     * @return Agent entity
     * @throws RuntimeException if agent not found
     */
    public Agent getAgentById(UUID agentId) {
        return agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found: " + agentId));
    }
    
    /**
     * Validate agent existence
     * @param agentId Agent ID
     * @throws RuntimeException if agent not found
     */
    public void validateAgentExists(UUID agentId) {
        if (agentId == null) {
            throw new IllegalArgumentException("agentId must not be null");
        }
        
        if (!agentRepository.existsById(agentId)) {
            throw new RuntimeException("Agent not found: " + agentId);
        }
    }
}

