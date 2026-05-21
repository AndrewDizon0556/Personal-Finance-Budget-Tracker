package com.budgettracker.controller;

import com.budgettracker.dto.SubscriptionResponse;
import com.budgettracker.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SubscriptionResponse>> getUpcomingSubscriptions(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return ResponseEntity.ok(subscriptionService.getUpcomingRenewals(userId));
    }
}
