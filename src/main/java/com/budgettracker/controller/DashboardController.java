package com.budgettracker.controller;

import com.budgettracker.dto.DashboardResponse;
import com.budgettracker.entity.User;
import com.budgettracker.exception.BadRequestException;
import com.budgettracker.service.DashboardService;
import com.budgettracker.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(DashboardService dashboardService, UserService userService) {
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        User user = userService.findById(userId)
                .orElseThrow(() -> new BadRequestException("Unknown user"));
        return ResponseEntity.ok(dashboardService.getDashboard(user));
    }
}
