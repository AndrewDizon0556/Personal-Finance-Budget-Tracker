package com.iponchallenge.controller;

import com.iponchallenge.dto.FinancialHealthScoreResponse;
import com.iponchallenge.service.FinancialHealthScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/financial-health")
@RequiredArgsConstructor
public class FinancialHealthScoreController {

    private final FinancialHealthScoreService healthScoreService;

    @GetMapping
    public ResponseEntity<FinancialHealthScoreResponse> getScore(Authentication auth) {
        return ResponseEntity.ok(healthScoreService.getScore(auth.getName()));
    }
}
