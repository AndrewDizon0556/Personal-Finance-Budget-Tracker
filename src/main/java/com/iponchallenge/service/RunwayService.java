package com.iponchallenge.service;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.RunwayStatus;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class RunwayService {

    private static final int LOOKBACK_DAYS = 14;

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public RunwayResponse getRunway(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal totalSpent = expenseRepository.sumByUserAndDateBetweenAndType(
                user, startOfMonth, endOfMonth, TransactionType.EXPENSE
        );

        BigDecimal monthlyAllowance = user.getMonthlyAllowance() != null
                ? user.getMonthlyAllowance() : BigDecimal.ZERO;
        BigDecimal remainingBalance = monthlyAllowance.subtract(totalSpent);

        BigDecimal avgDailySpending = calculateAvgDailySpending(user, today);
        int estimatedDaysRemaining = calculateEstimatedDays(remainingBalance, avgDailySpending);
        int daysUntilNextAllowance = calculateDaysUntilNextAllowance(user.getAllowanceSchedule(), today);

        RunwayStatus status = determineStatus(estimatedDaysRemaining, daysUntilNextAllowance);
        String message = buildMessage(status, estimatedDaysRemaining);

        return RunwayResponse.builder()
                .remainingBalance(remainingBalance)
                .avgDailySpending(avgDailySpending)
                .estimatedDaysRemaining(estimatedDaysRemaining)
                .daysUntilNextAllowance(daysUntilNextAllowance)
                .runwayStatus(status)
                .message(message)
                .build();
    }

    private BigDecimal calculateAvgDailySpending(User user, LocalDate today) {
        LocalDate lookbackStart = today.minusDays(LOOKBACK_DAYS);
        BigDecimal total = expenseRepository.sumByUserAndDateBetweenAndType(
                user, lookbackStart, today, TransactionType.EXPENSE
        );
        return total.divide(BigDecimal.valueOf(LOOKBACK_DAYS), 2, RoundingMode.HALF_UP);
    }

    private int calculateEstimatedDays(BigDecimal remaining, BigDecimal avgDaily) {
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) return 0;
        if (avgDaily.compareTo(BigDecimal.ZERO) == 0) return 999;
        return remaining.divide(avgDaily, 0, RoundingMode.FLOOR).intValue();
    }

    private int calculateDaysUntilNextAllowance(AllowanceSchedule schedule, LocalDate today) {
        if (schedule == null || schedule == AllowanceSchedule.MONTHLY) {
            return (int) today.until(today.with(TemporalAdjusters.lastDayOfMonth()),
                    java.time.temporal.ChronoUnit.DAYS) + 1;
        }
        if (schedule == AllowanceSchedule.WEEKLY) {
            return 8 - today.getDayOfWeek().getValue();
        }
        // BIWEEKLY: 1st–15th or 16th–end of month
        int day = today.getDayOfMonth();
        if (day <= 15) {
            return 15 - day + 1;
        }
        return (int) today.until(today.with(TemporalAdjusters.lastDayOfMonth()),
                java.time.temporal.ChronoUnit.DAYS) + 1;
    }

    private RunwayStatus determineStatus(int estimated, int daysUntilNext) {
        if (estimated >= daysUntilNext) return RunwayStatus.SAFE;
        if (estimated >= daysUntilNext / 2) return RunwayStatus.WARNING;
        return RunwayStatus.CRITICAL;
    }

    private String buildMessage(RunwayStatus status, int estimatedDays) {
        return switch (status) {
            case SAFE -> "You're on track! Your allowance should last until the next payout.";
            case WARNING -> "Heads up! Your allowance may run out in " + estimatedDays + " days.";
            case CRITICAL -> "Critical! Your allowance may run out in " + estimatedDays + " days. Spend carefully.";
        };
    }
}
