package com.budgettracker.service;

import com.budgettracker.dto.DashboardResponse;
import com.budgettracker.entity.Expense;
import com.budgettracker.entity.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {
    private final AllowanceService allowanceService;
    private final ExpenseService expenseService;

    public DashboardService(AllowanceService allowanceService, ExpenseService expenseService) {
        this.allowanceService = allowanceService;
        this.expenseService = expenseService;
    }

    public DashboardResponse getDashboard(User user) {
        BigDecimal balance = allowanceService.calculateRemainingBalance(user);
        BigDecimal safeSpend = allowanceService.calculateDailySafeSpend(user);
        LocalDate nextDate = allowanceService.getNextAllowanceDate(user);
        BigDecimal averageExpense = calculateAverageDailyExpense(user);
        long runwayDays = calculateRunwayDays(balance, safeSpend, averageExpense);
        String message = buildRunwayMessage(runwayDays);
        return new DashboardResponse(balance, safeSpend, nextDate, runwayDays, message);
    }

    private BigDecimal calculateAverageDailyExpense(User user) {
        LocalDate start = allowanceService.getNextAllowanceDate(user).minusDays(
                switch (user.getSchedule()) {
                    case WEEKLY -> 7;
                    case BIWEEKLY -> 14;
                    default -> 30;
                }
        );
        LocalDate today = LocalDate.now();
        if (today.isBefore(start)) {
            start = user.getCreatedAt();
        }
        List<Expense> expenses = expenseService.getExpensesForWindow(user.getId(), start, today);
        if (expenses.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long days = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(start, today) + 1);
        return total.divide(BigDecimal.valueOf(days), 2, BigDecimal.ROUND_HALF_UP);
    }

    private long calculateRunwayDays(BigDecimal balance, BigDecimal safeSpend, BigDecimal averageExpense) {
        if (averageExpense.compareTo(BigDecimal.ZERO) == 0) {
            return safeSpend.compareTo(BigDecimal.ZERO) == 0 ? 0 : Math.max(1, balance.divide(safeSpend, 0, BigDecimal.ROUND_HALF_UP).longValue());
        }
        return Math.max(0, balance.divide(averageExpense, 0, BigDecimal.ROUND_HALF_UP).longValue());
    }

    private String buildRunwayMessage(long runwayDays) {
        if (runwayDays >= 7) {
            return "Healthy spending";
        }
        if (runwayDays >= 4) {
            return "Warning";
        }
        return "Critical";
    }
}
