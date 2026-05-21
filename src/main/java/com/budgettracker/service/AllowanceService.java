package com.budgettracker.service;

import com.budgettracker.entity.AllowanceSchedule;
import com.budgettracker.entity.Expense;
import com.budgettracker.entity.User;
import com.budgettracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class AllowanceService {
    private final ExpenseRepository expenseRepository;

    public AllowanceService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public BigDecimal calculateRemainingBalance(User user) {
        BigDecimal allowance = calculateAllowanceAmount(user);
        LocalDate windowStart = getCurrentAllowanceWindowStart(user);
        LocalDate today = LocalDate.now();
        List<Expense> expenses = expenseRepository.findByUserIdAndDateBetween(user.getId(), windowStart, today);
        BigDecimal totalSpent = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remaining = allowance.subtract(totalSpent);
        return remaining.max(BigDecimal.ZERO);
    }

    public BigDecimal calculateDailySafeSpend(User user) {
        BigDecimal remainingBalance = calculateRemainingBalance(user);
        long remainingDays = getRemainingDays(user);
        if (remainingDays <= 0) {
            return BigDecimal.ZERO;
        }
        return remainingBalance.divide(BigDecimal.valueOf(remainingDays), 2, BigDecimal.ROUND_HALF_UP);
    }

    public LocalDate getNextAllowanceDate(User user) {
        LocalDate start = getCurrentAllowanceWindowStart(user);
        return switch (user.getSchedule()) {
            case WEEKLY -> start.plusDays(7);
            case BIWEEKLY -> start.plusDays(14);
            default -> start.plusDays(30);
        };
    }

    public BigDecimal calculateAllowanceAmount(User user) {
        BigDecimal monthly = user.getMonthlyAllowance();
        if (user.getSchedule() == AllowanceSchedule.WEEKLY) {
            return monthly.divide(BigDecimal.valueOf(4), 2, BigDecimal.ROUND_HALF_UP);
        }
        if (user.getSchedule() == AllowanceSchedule.BIWEEKLY) {
            return monthly.divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);
        }
        return monthly;
    }

    private LocalDate getCurrentAllowanceWindowStart(User user) {
        LocalDate createdAt = user.getCreatedAt();
        LocalDate today = LocalDate.now();
        long windowDays = switch (user.getSchedule()) {
            case WEEKLY -> 7;
            case BIWEEKLY -> 14;
            default -> 30;
        };
        long daysSinceStart = Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(createdAt, today));
        long completedWindows = daysSinceStart / windowDays;
        return createdAt.plusDays(completedWindows * windowDays);
    }

    private long getRemainingDays(User user) {
        LocalDate nextAllowance = getNextAllowanceDate(user);
        long remaining = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextAllowance);
        return Math.max(remaining, 0);
    }
}
