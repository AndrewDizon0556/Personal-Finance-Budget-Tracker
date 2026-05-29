package com.iponchallenge.controller;

import com.iponchallenge.dto.AuthResponse;
import com.iponchallenge.dto.ChangePasswordRequest;
import com.iponchallenge.dto.LoginRequest;
import com.iponchallenge.dto.RegisterRequest;
import com.iponchallenge.dto.UpdateProfileRequest;
import com.iponchallenge.dto.UserResponse;
import com.iponchallenge.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        return ResponseEntity.ok(authService.getMe(authentication.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<AuthResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        return ResponseEntity.ok(authService.changePassword(authentication.getName(), request));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(Authentication authentication) {
        authService.logoutAll(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
