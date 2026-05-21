package com.budgettracker.controller;

import com.budgettracker.dto.ExpenseRequest;
import com.budgettracker.dto.ExpenseResponse;
import com.budgettracker.entity.Expense;
import com.budgettracker.entity.User;
import com.budgettracker.service.ExpenseService;
import com.budgettracker.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(HttpServletRequest request,
                                                         @Valid @RequestBody ExpenseRequest expenseRequest) {
        UUID userId = (UUID) request.getAttribute("userId");
        Expense expense = expenseService.createExpense(userId, expenseRequest);
        return ResponseEntity.ok(new ExpenseResponse(expense.getId(), expense.getAmount(), expense.getCategory(), expense.getNotes(), expense.getDate()));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(HttpServletRequest request,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "20") int size) {
        UUID userId = (UUID) request.getAttribute("userId");
        Page<Expense> expenses = expenseService.getExpenses(userId, page, size);
        List<ExpenseResponse> response = expenses.stream()
                .map(expense -> new ExpenseResponse(expense.getId(), expense.getAmount(), expense.getCategory(), expense.getNotes(), expense.getDate()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
