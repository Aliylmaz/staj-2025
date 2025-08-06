package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.agent.AddAgentRequest;
import com.ada.insurance_app.request.agent.UpdateAgentRequest;
import com.ada.insurance_app.request.user.ChangeRoleRequest;
import com.ada.insurance_app.response.TestAdminResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

public interface IAdminService {
    List<UserDto> getAllUsers();
    UserDto changeUserRole(ChangeRoleRequest request);
    DashboardSummaryDto getSummaryReport();
    UserDto getUserByIdForAdmin(UUID userId);

    AgentDto createAgent(AddAgentRequest request);
    AgentDto updateAgent(String agentNumber, UpdateAgentRequest request);
    void deleteAgentByAgentNumber(String agentNumber);
    List<AgentDto> getAllAgents();
    List<AgentStatsDto> getAgentStatistics();
} 