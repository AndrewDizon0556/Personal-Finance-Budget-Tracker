package com.iponchallenge.service;

import com.iponchallenge.config.JwtUtils;
import com.iponchallenge.dto.AuthResponse;
import com.iponchallenge.dto.ChangePasswordRequest;
import com.iponchallenge.dto.LoginRequest;
import com.iponchallenge.dto.RegisterRequest;
import com.iponchallenge.dto.UpdateProfileRequest;
import com.iponchallenge.dto.UserResponse;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.UnauthorizedException;
import com.iponchallenge.mapper.UserMapper;
import com.iponchallenge.repository.UserRepository;
import com.iponchallenge.security.LoginAttemptService;
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
    private final LoginAttemptService loginAttemptService;

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
        String token = jwtUtils.generateToken(saved.getEmail(), saved.getTokenVersion());

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toResponse(saved))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail();

        if (loginAttemptService.isLocked(email)) {
            throw new UnauthorizedException(
                    "Account temporarily locked due to too many failed attempts. Try again in a few minutes.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loginAttemptService.recordFailure(email);
            throw new UnauthorizedException("Invalid email or password");
        }

        loginAttemptService.recordSuccess(email);
        String token = jwtUtils.generateToken(user.getEmail(), user.getTokenVersion());

        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toResponse(user))
                .build();
    }

    /** Verifies the current password, sets a new one, and revokes all existing sessions. */
    public AuthResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from the current one");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1); // invalidate old tokens
        User saved = userRepository.save(user);

        String token = jwtUtils.generateToken(saved.getEmail(), saved.getTokenVersion());
        return AuthResponse.builder()
                .token(token)
                .user(userMapper.toResponse(saved))
                .build();
    }

    /** Revokes every previously issued token for this user (log out of all devices). */
    public void logoutAll(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
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
