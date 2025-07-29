package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.DashboardSummaryDto;
import com.ada.insurance_app.dto.UserDto;
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
   // ResponseEntity<TestAdminResponse> getAllUser(HttpServletRequest request);
    ResponseEntity<TestAdminResponse> getUserById( UUID userId, HttpServletRequest request);

} 