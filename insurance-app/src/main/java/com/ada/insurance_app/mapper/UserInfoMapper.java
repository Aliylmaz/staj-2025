package com.ada.insurance_app.mapper;

import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.stereotype.Service;

@Service
@Mapper(componentModel = "spring")
public interface UserInfoMapper {

    
    UserDto fromUserInfo(User user);
}