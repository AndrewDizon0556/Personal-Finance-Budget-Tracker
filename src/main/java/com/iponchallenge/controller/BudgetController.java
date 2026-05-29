package com.iponchallenge.controller;

import com.iponchallenge.dto.BudgetRequest;
import com.iponchallenge.dto.BudgetResponse;
import com.iponchallenge.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication auth) {
        return ResponseEntity.ok(budgetService.getBudgets(auth.getName(), month, year));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable UUID id,
            @Valid @RequestBody BudgetRequest request,
            Authentication auth) {
        return ResponseEntity.ok(budgetService.updateBudget(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID id, Authentication auth) {
        budgetService.deleteBudget(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
