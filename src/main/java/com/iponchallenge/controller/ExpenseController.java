package com.iponchallenge.controller;

import com.iponchallenge.dto.ExpenseRequest;
import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication auth) {
        return ResponseEntity.ok(expenseService.getExpenses(auth.getName(), month, year));
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseService.createExpense(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID id,
            @Valid @RequestBody ExpenseRequest request,
            Authentication auth) {
        return ResponseEntity.ok(expenseService.updateExpense(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id, Authentication auth) {
        expenseService.deleteExpense(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
