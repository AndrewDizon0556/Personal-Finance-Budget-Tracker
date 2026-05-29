package com.iponchallenge.mapper;

import com.iponchallenge.dto.UserResponse;
import com.iponchallenge.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .schoolName(user.getSchoolName())
                .email(user.getEmail())
                .monthlyAllowance(user.getMonthlyAllowance())
                .allowanceSchedule(user.getAllowanceSchedule())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
