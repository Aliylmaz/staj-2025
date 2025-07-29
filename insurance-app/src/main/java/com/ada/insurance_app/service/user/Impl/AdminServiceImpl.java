package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.core.enums.Role;
import com.ada.insurance_app.core.exception.UserNotFoundException;
import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.IUserRepository;
import com.ada.insurance_app.request.user.ChangeRoleRequest;
import com.ada.insurance_app.service.dashboard.Impl.DashboardServiceImpl;
import com.ada.insurance_app.service.user.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {
    private final IUserRepository userRepository;
    private final UserInfoMapper userInfoMapper;
    private final DashboardServiceImpl dashboardService;

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
                dashboardService.getTotalCustomerCount(),
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
} 