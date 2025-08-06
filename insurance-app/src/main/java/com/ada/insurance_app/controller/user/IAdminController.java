package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
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

public interface IAdminController {
    ResponseEntity<GeneralResponse<List<UserDto>>> getAllUsers();
    ResponseEntity<GeneralResponse<UserDto>> changeUserRole(ChangeRoleRequest request);
    ResponseEntity<GeneralResponse<DashboardSummaryDto>> getSummaryReport();

    ResponseEntity<TestAdminResponse> getUserById( UUID userId, HttpServletRequest request);

    ResponseEntity<GeneralResponse<AgentDto>> createAgent(AddAgentRequest request);

    ResponseEntity<GeneralResponse<AgentDto>> updateAgent(String agentNumber, UpdateAgentRequest request);

    ResponseEntity<GeneralResponse<Void>> deleteAgentByAgentNumber(String agentNumber);

    ResponseEntity<GeneralResponse<List<AgentDto>>> getAllAgents();

    ResponseEntity<GeneralResponse<List<AgentStatsDto>>> getAgentStatistics();
} 