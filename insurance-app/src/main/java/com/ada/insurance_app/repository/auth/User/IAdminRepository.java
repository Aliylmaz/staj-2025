package com.ada.insurance_app.repository.auth.User;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.request.user.ChangeRoleRequest;
import com.ada.insurance_app.response.TestAdminResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface IAdminRepository extends JpaRepository<User, UUID> {

}
