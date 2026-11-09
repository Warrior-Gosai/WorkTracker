package com.devworktracker.auth.mapper;

import com.devworktracker.auth.dto.UserResponse;
import com.devworktracker.auth.entity.AppUser;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(AppUser user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus()
        );
    }
}

