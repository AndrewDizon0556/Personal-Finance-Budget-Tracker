package com.budgettracker.controller;

import com.budgettracker.dto.AuthRequest;
import com.budgettracker.dto.AuthResponse;
import com.budgettracker.dto.RegisterRequest;
import com.budgettracker.entity.User;
import com.budgettracker.exception.BadRequestException;
import com.budgettracker.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@Validated @RequestBody RegisterRequest request) {
        if (request.getPassword().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setSchool(request.getSchool());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setMonthlyAllowance(request.getMonthlyAllowance());
        user.setSchedule(request.getAllowanceSchedule());
        user.setCreatedAt(LocalDate.now());
        authService.register(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Validated @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}
