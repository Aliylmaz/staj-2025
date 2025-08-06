package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.IAdminController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.request.agent.AddAgentRequest;
import com.ada.insurance_app.request.agent.UpdateAgentRequest;
import com.ada.insurance_app.request.user.ChangeRoleRequest;
import com.ada.insurance_app.response.TestAdminResponse;
import com.ada.insurance_app.service.user.IAdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminControllerImpl implements IAdminController {
    private final IAdminService adminService;

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<GeneralResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(GeneralResponse.success("User list", users));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/change-role")
    public ResponseEntity<GeneralResponse<UserDto>> changeUserRole(@Valid @RequestBody ChangeRoleRequest request) {
        UserDto updated = adminService.changeUserRole(request);
        return ResponseEntity.ok(GeneralResponse.success("User role updated", updated));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/summary-report")
    public ResponseEntity<GeneralResponse<DashboardSummaryDto>> getSummaryReport() {

        DashboardSummaryDto summary = adminService.getSummaryReport();
        return ResponseEntity.ok(GeneralResponse.success("Dashboard summary report", summary));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<TestAdminResponse> getUserById(@PathVariable UUID userId, HttpServletRequest request) {
        TestAdminResponse response = new TestAdminResponse(
                "User fetched successfully",
                adminService.getUserByIdForAdmin(userId),
                HttpStatus.OK.value(),
                true,
                LocalDateTime.now().toString(),
                request.getRequestURI()
        );
        return ResponseEntity.ok(response);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create-agent")
    public ResponseEntity<GeneralResponse<AgentDto>> createAgent(@Valid @RequestBody AddAgentRequest request) {
        AgentDto agentDto = adminService.createAgent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(GeneralResponse.success("Agent created successfully", agentDto));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update-agent/{agentNumber}")
    public ResponseEntity<GeneralResponse<AgentDto>> updateAgent(
            @PathVariable String agentNumber,
            @Valid @RequestBody UpdateAgentRequest request) {

        AgentDto updatedAgent = adminService.updateAgent(agentNumber, request);
        return ResponseEntity.ok(GeneralResponse.success("Agent updated successfully", updatedAgent));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete-agent/{agentNumber}")
    public ResponseEntity<GeneralResponse<Void>> deleteAgentByAgentNumber(@PathVariable String agentNumber) {
        adminService.deleteAgentByAgentNumber(agentNumber);
        return ResponseEntity.ok(GeneralResponse.success("Agent deleted successfully", null));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/agents")
    public ResponseEntity<GeneralResponse<List<AgentDto>>> getAllAgents() {
        List<AgentDto> agents = adminService.getAllAgents();
        return ResponseEntity.ok(GeneralResponse.success("Agent list", agents));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/agent-statistics")
    public ResponseEntity<GeneralResponse<List<AgentStatsDto>>> getAgentStatistics() {
        List<AgentStatsDto> agentStats = adminService.getAgentStatistics();
        return ResponseEntity.ok(GeneralResponse.success("Agent statistics", agentStats));
    }
} 