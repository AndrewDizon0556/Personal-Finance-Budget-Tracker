package com.iponchallenge.service;

import com.iponchallenge.dto.PurchaseAdvisorResponse;
import com.iponchallenge.entity.Budget;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseAdvisorService {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    public PurchaseAdvisorResponse check(String email, BigDecimal amount, UUID categoryId) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year  = today.getYear();

        // Find relevant budget — category-specific first, then fall back to total
        List<Budget> budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        Budget relevant = categoryId != null
                ? budgets.stream()
                        .filter(b -> b.getCategory().getId().equals(categoryId))
                        .findFirst()
                        .orElse(null)
                : null;

        if (relevant == null && budgets.isEmpty()) {
            // No budget configured — return low-risk advisory only
            return PurchaseAdvisorResponse.builder()
                    .purchaseAmount(amount)
                    .hasBudget(false)
                    .risk("LOW")
                    .advice("No budget configured for this month. Consider setting one to track spending.")
                    .dailyBudget(BigDecimal.ZERO)
                    .spentToday(BigDecimal.ZERO)
                    .remainingTodayBefore(BigDecimal.ZERO)
                    .remainingTodayAfter(BigDecimal.ZERO)
                    .budgetImpactPercent(0)
                    .build();
        }

        // Daily budget = remaining budget / days left in month
        long daysLeft = Math.max(today.lengthOfMonth() - today.getDayOfMonth() + 1, 1);
        BigDecimal remainingBudget = relevant != null
                ? relevant.getRemainingBudget()
                : budgets.stream()
                        .map(Budget::getRemainingBudget)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal dailyBudget = remainingBudget.divide(BigDecimal.valueOf(daysLeft), 2, RoundingMode.HALF_UP);

        // How much already spent today
        BigDecimal spentToday = expenseRepository.sumByUserAndDateBetweenAndType(
                user, today, today, TransactionType.EXPENSE);

        BigDecimal remainingToday = dailyBudget.subtract(spentToday);
        BigDecimal remainingAfter = remainingToday.subtract(amount);

        // Budget impact: what % of the daily budget this purchase represents
        double impact = dailyBudget.compareTo(BigDecimal.ZERO) > 0
                ? amount.divide(dailyBudget, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 100.0;

        String risk;
        String advice;
        if (remainingAfter.compareTo(BigDecimal.ZERO) < 0) {
            risk = "HIGH";
            advice = "This purchase exceeds today's budget. You'll be ₱"
                    + remainingAfter.negate().toPlainString() + " over your daily limit.";
        } else if (impact >= 50) {
            risk = "MEDIUM";
            advice = "This purchase uses " + String.format("%.0f", impact)
                    + "% of your daily budget. You'll have ₱" + remainingAfter.toPlainString() + " left today.";
        } else {
            risk = "LOW";
            advice = "Looks good! You'll still have ₱" + remainingAfter.toPlainString() + " in today's budget after this.";
        }

        return PurchaseAdvisorResponse.builder()
                .purchaseAmount(amount)
                .hasBudget(true)
                .dailyBudget(dailyBudget)
                .spentToday(spentToday)
                .remainingTodayBefore(remainingToday)
                .remainingTodayAfter(remainingAfter)
                .budgetImpactPercent(Math.min(impact, 100.0))
                .risk(risk)
                .advice(advice)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
