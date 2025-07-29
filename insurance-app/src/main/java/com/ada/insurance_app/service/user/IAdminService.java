package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
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
} 