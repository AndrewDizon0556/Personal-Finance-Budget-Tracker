package com.iponchallenge.controller;

import com.iponchallenge.dto.GoalContributionRequest;
import com.iponchallenge.dto.SavingsGoalRequest;
import com.iponchallenge.dto.SavingsGoalResponse;
import com.iponchallenge.service.SavingsGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @GetMapping
    public ResponseEntity<List<SavingsGoalResponse>> getGoals(Authentication auth) {
        return ResponseEntity.ok(savingsGoalService.getGoals(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SavingsGoalResponse> createGoal(
            @Valid @RequestBody SavingsGoalRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savingsGoalService.createGoal(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalResponse> updateGoal(
            @PathVariable UUID id,
            @Valid @RequestBody SavingsGoalRequest request,
            Authentication auth) {
        return ResponseEntity.ok(savingsGoalService.updateGoal(auth.getName(), id, request));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<SavingsGoalResponse> contribute(
            @PathVariable UUID id,
            @Valid @RequestBody GoalContributionRequest request,
            Authentication auth) {
        return ResponseEntity.ok(savingsGoalService.contribute(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable UUID id, Authentication auth) {
        savingsGoalService.deleteGoal(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
