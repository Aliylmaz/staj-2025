package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.core.exception.UserNotFoundException;
import com.ada.insurance_app.dto.AgentDto;
import com.ada.insurance_app.dto.AgentStatsDto;
import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.Agent;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.mapper.AgentMapper;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.auth.User.IUserRepository;
import com.ada.insurance_app.repository.IAgentRepository;
import com.ada.insurance_app.request.agent.AddAgentRequest;
import com.ada.insurance_app.request.agent.UpdateAgentRequest;
import com.ada.insurance_app.request.user.ChangeRoleRequest;
import com.ada.insurance_app.service.dashboard.Impl.DashboardServiceImpl;
import com.ada.insurance_app.service.user.IAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {
    private final IUserRepository userRepository;
    private final UserInfoMapper userInfoMapper;
    private final DashboardServiceImpl dashboardService;
    private final IAgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userInfoMapper::fromUserInfo)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto changeUserRole(ChangeRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found: " + request.getUserId()));
        user.setRole(request.getRole());
        userRepository.save(user);
        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    public DashboardSummaryDto getSummaryReport() {
        return new DashboardSummaryDto(
                dashboardService.getTotalPolicyCount(),
                dashboardService.getTotalUserInSystem(),
                dashboardService.getTotalClaimCount(),
                dashboardService.getTotalPaymentCount(),
                dashboardService.getTotalOfferCount(),
                dashboardService.getTotalPremiumSum()
        );
    }


    @Override
    public UserDto getUserByIdForAdmin(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    @Transactional
    public AgentDto createAgent(AddAgentRequest request) {
        // 1. Email ve username kontrolü
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        if (userRepository.existsByUsername(request.getUser().getUsername())) {
            throw new IllegalArgumentException("Username already in use");
        }

        // 2. User oluşturuluyor - Agent email'ini user email'i olarak kullan
        User user = new User();
        user.setUsername(request.getUser().getUsername());
        user.setEmail(request.getEmail()); // Agent email'ini kullan
        user.setPassword(passwordEncoder.encode(request.getUser().getPassword()));
        user.setFirstName(request.getName()); // Agent name'ini firstName olarak kullan
        user.setLastName(""); // Boş bırak
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.AGENT);
        user.setActive(true);
        user = userRepository.save(user);

        // 3. Agent oluşturuluyor
        Agent agent = new Agent();
        agent.setUser(user);
        agent.setName(request.getName());
        agent.setPhoneNumber(request.getPhoneNumber());
        agent.setEmail(request.getEmail());

        // 4. Agent number backend'de otomatik üretiliyor
        String generatedAgentNumber = "AGT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        agent.setAgentNumber(generatedAgentNumber);

        agent = agentRepository.save(agent);



        return AgentMapper.INSTANCE.toDto(agent);
    }


    @Override
    public AgentDto updateAgent(String agentNumber, UpdateAgentRequest request) {

        Agent agent = agentRepository.findAgentByAgentNumber(agentNumber)
                .orElseThrow(() -> new UserNotFoundException("Agent not found with agent number: " + agentNumber));

        // Update user information
        User user = agent.getUser();
        user.setUsername(request.getUser().getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getName());
        user.setLastName("");
        user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);

        // Update agent information
        agent.setName(request.getName());
        agent.setPhoneNumber(request.getPhoneNumber());
        agent.setEmail(request.getEmail());

        agent = agentRepository.save(agent);

        return AgentMapper.INSTANCE.toDto(agent);
    }

    @Override
    public void deleteAgentByAgentNumber(String agentNumber) {
        Agent agent = agentRepository.findAgentByAgentNumber(agentNumber)
                .orElseThrow(() -> new UserNotFoundException("Agent not found with agent number: " + agentNumber));

        // Delete the agent
        agentRepository.delete(agent);
        userRepository.delete(agent.getUser());




    }

    @Override
    public List<AgentDto> getAllAgents() {
        return agentRepository.findAll().stream()
                .map(AgentMapper.INSTANCE::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgentStatsDto> getAgentStatistics() {
       return dashboardService.getAgentStatistics();
    }
} 