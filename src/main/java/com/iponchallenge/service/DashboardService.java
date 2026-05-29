package com.iponchallenge.service;

import com.iponchallenge.dto.BudgetResponse;
import com.iponchallenge.dto.DashboardResponse;
import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.mapper.BudgetMapper;
import com.iponchallenge.mapper.ExpenseMapper;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ExpenseMapper expenseMapper;
    private final BudgetMapper budgetMapper;
    private final RunwayService runwayService;

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal totalSpent = expenseRepository.sumByUserAndDateBetweenAndType(
                user, startOfMonth, endOfMonth, TransactionType.EXPENSE
        );

        BigDecimal monthlyAllowance = user.getMonthlyAllowance();
        BigDecimal remainingBalance = monthlyAllowance != null
                ? monthlyAllowance.subtract(totalSpent)
                : BigDecimal.ZERO.subtract(totalSpent);

        RunwayResponse runway = runwayService.getRunway(email);

        // "Days left" follows the user's allowance cycle (weekly / bi-weekly / monthly),
        // i.e. the days until their next allowance — not just the calendar month end.
        // The client may still override this number for a custom budgeting horizon.
        int daysLeft = runway.getDaysUntilNextAllowance();
        if (daysLeft <= 0) {
            daysLeft = (int) ChronoUnit.DAYS.between(today, endOfMonth) + 1;
        }
        BigDecimal dailySafeSpend = calculateDailySafeSpend(remainingBalance, daysLeft);

        List<BudgetResponse> budgets = budgetRepository
                .findByUserAndMonthAndYear(user, today.getMonthValue(), today.getYear())
                .stream().map(budgetMapper::toResponse).collect(Collectors.toList());

        List<ExpenseResponse> recent = expenseRepository
                .findTop5ByUserOrderByExpenseDateDescCreatedAtDesc(user)
                .stream().map(expenseMapper::toResponse).collect(Collectors.toList());

        return DashboardResponse.builder()
                .monthlyAllowance(monthlyAllowance)
                .allowanceSchedule(user.getAllowanceSchedule())
                .totalSpentThisMonth(totalSpent)
                .remainingBalance(remainingBalance)
                .dailySafeSpend(dailySafeSpend)
                .daysLeftInMonth(daysLeft)
                .budgets(budgets)
                .recentTransactions(recent)
                .runwayStatus(runway.getRunwayStatus())
                .estimatedDaysRemaining(runway.getEstimatedDaysRemaining())
                .daysUntilNextAllowance(runway.getDaysUntilNextAllowance())
                .runwayMessage(runway.getMessage())
                .build();
    }

    private BigDecimal calculateDailySafeSpend(BigDecimal remainingBalance, int daysLeft) {
        if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0 || daysLeft <= 0) {
            return BigDecimal.ZERO;
        }
        return remainingBalance.divide(BigDecimal.valueOf(daysLeft), 2, RoundingMode.HALF_DOWN);
    }
}
