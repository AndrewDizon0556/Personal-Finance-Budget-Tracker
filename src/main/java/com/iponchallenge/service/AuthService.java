package com.iponchallenge.service;

import com.iponchallenge.config.JwtUtils;
import com.iponchallenge.dto.AuthResponse;
import com.iponchallenge.dto.LoginRequest;
import com.iponchallenge.dto.RegisterRequest;
import com.iponchallenge.dto.UpdateProfileRequest;
import com.iponchallenge.dto.UserResponse;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.UnauthorizedException;
import com.iponchallenge.mapper.UserMapper;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserMapper userMapper;
    private final ExpenseCategoryService expenseCategoryService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .schoolName(request.getSchoolName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        expenseCategoryService.createDefaultCategories(saved);
        String token = jwtUtils.generateToken(saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toResponse(saved))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toResponse(user))
                .build();
    }

    public UserResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return userMapper.toResponse(user);
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getSchoolName() != null) {
            user.setSchoolName(request.getSchoolName().trim());
        }
        if (request.getMonthlyAllowance() != null) {
            user.setMonthlyAllowance(request.getMonthlyAllowance());
        }
        if (request.getAllowanceSchedule() != null) {
            user.setAllowanceSchedule(request.getAllowanceSchedule());
        }

        return userMapper.toResponse(userRepository.save(user));
    }
}
