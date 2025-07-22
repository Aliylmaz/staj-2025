package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserInfoMapper {

    public UserDto fromUserInfo(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());

        return dto;


    }


}