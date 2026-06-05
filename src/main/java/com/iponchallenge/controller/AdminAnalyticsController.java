package com.iponchallenge.controller;

import com.iponchallenge.dto.AdminAnalyticsResponse;
import com.iponchallenge.service.AdminAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only "App Growth" analytics endpoint.
 *
 * Locked to the ADMIN role by SecurityConfig (/api/admin/** -> hasRole("ADMIN")),
 * so a regular user cannot reach it even by calling the API directly. Returns
 * aggregated statistics only — no individual user data is exposed.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminAnalyticsService.getAnalytics());
    }
}
