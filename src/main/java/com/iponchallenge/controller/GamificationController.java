package com.iponchallenge.controller;

import com.iponchallenge.dto.GamificationResponse;
import com.iponchallenge.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/me")
    public ResponseEntity<GamificationResponse> getMyGamification(Authentication auth) {
        return ResponseEntity.ok(gamificationService.getForUser(auth.getName()));
    }
}
