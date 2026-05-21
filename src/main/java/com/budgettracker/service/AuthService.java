package com.budgettracker.service;

import com.budgettracker.config.JwtUtils;
import com.budgettracker.dto.AuthRequest;
import com.budgettracker.dto.AuthResponse;
import com.budgettracker.entity.User;
import com.budgettracker.exception.BadRequestException;
import com.budgettracker.exception.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final SessionManager sessionManager;

    public AuthService(UserService userService, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, SessionManager sessionManager) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.sessionManager = sessionManager;
    }

    public AuthResponse authenticate(AuthRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        String token = jwtUtils.generateToken(user.getId());
        sessionManager.registerSession(user.getId(), token);
        return new AuthResponse(token, user.getId());
    }

    public User register(User user) {
        if (user.getPasswordHash().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        return userService.createUser(user);
    }
}
