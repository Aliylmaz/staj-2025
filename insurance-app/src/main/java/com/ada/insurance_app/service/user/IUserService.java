package com.ada.insurance_app.service.user;

import com.ada.insurance_app.dto.UserDto;
import java.util.List;
import java.util.UUID;

public interface IUserService {
    UserDto getUserById(UUID userId);
    UserDto getUserByEmail(String email);
    List<UserDto> getAllUsers();
    UserDto updateUser(UUID userId, UserDto userDto);
    void deleteUser(UUID userId);
}
