package com.iponchallenge.controller;

import com.iponchallenge.dto.InsightDto;
import com.iponchallenge.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping
    public ResponseEntity<List<InsightDto>> getMyInsights(Authentication auth) {
        return ResponseEntity.ok(insightsService.getForUser(auth.getName()));
    }
}
