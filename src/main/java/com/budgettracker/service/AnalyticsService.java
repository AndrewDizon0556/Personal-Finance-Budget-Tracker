package com.budgettracker.service;

import com.budgettracker.dto.CategoryTotalsResponse;
import com.budgettracker.entity.Expense;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {
    private final ExpenseService expenseService;

    public AnalyticsService(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    public CategoryTotalsResponse getCategoryTotals(java.util.UUID userId) {
        List<Expense> expenses = expenseService.getAllExpenses(userId);
        Map<String, BigDecimal> totals = new HashMap<>();
        for (Expense expense : expenses) {
            String category = expense.getCategory().name();
            totals.put(category, totals.getOrDefault(category, BigDecimal.ZERO).add(expense.getAmount()));
        }
        return new CategoryTotalsResponse(totals);
    }
}
