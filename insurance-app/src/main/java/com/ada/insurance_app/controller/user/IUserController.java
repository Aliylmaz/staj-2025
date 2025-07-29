package com.ada.insurance_app.controller.user;

import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.UserDto;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

public interface IUserController {

    ResponseEntity<GeneralResponse<UserDto>> getUserById(UUID userId);

    ResponseEntity<GeneralResponse<UserDto>> getUserByEmail(String email);

    ResponseEntity<GeneralResponse<List<UserDto>>> getAllUsers();

    ResponseEntity<GeneralResponse<UserDto>> updateUser(UUID userId, UserDto userDto);

    ResponseEntity<GeneralResponse<Void>> deleteUser(UUID userId);
}