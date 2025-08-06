package com.ada.insurance_app.controller.user.Impl;

import com.ada.insurance_app.controller.user.IUserController;
import com.ada.insurance_app.core.common.dto.GeneralResponse;
import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.service.user.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserControllerImpl implements IUserController {

    private final IUserService userService;

    @Override
    @GetMapping("/{userId}")
    public ResponseEntity<GeneralResponse<UserDto>> getUserById(@PathVariable UUID userId) {
        UserDto user = userService.getUserById(userId);
        return ResponseEntity.ok(GeneralResponse.success("User retrieved successfully", user));
    }

    @Override
    @GetMapping("/email/{email}")
    public ResponseEntity<GeneralResponse<UserDto>> getUserByEmail(@PathVariable String email) {
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(GeneralResponse.success("User retrieved successfully", user));
    }

    @Override
    @GetMapping
    public ResponseEntity<GeneralResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(GeneralResponse.success("All users retrieved successfully", users));
    }

    @Override
    @PutMapping("/{userId}")
    public ResponseEntity<GeneralResponse<UserDto>> updateUser(@PathVariable UUID userId,
                                                             @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateUser(userId, userDto);
        return ResponseEntity.ok(GeneralResponse.success("User updated successfully", updatedUser));
    }

    @Override
    @DeleteMapping("/{userId}")
    public ResponseEntity<GeneralResponse<Void>> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(GeneralResponse.success("User deleted successfully", null));
    }
}