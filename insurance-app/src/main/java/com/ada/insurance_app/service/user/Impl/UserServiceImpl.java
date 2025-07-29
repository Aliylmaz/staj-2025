package com.ada.insurance_app.service.user.Impl;

import com.ada.insurance_app.dto.UserDto;
import com.ada.insurance_app.entity.User;
import com.ada.insurance_app.mapper.UserInfoMapper;
import com.ada.insurance_app.repository.IUserRepository;
import com.ada.insurance_app.service.user.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final IUserRepository userRepository;
    private final UserInfoMapper userInfoMapper;

    @Override
    public UserDto getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userInfoMapper::fromUserInfo)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDto updateUser(UUID userId, UserDto userDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        user.setEmail(userDto.getEmail());
        userRepository.save(user);
        return userInfoMapper.fromUserInfo(user);
    }

    @Override
    public void deleteUser(UUID userId) {
        userRepository.deleteById(userId);
    }
}
