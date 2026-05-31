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
import java.time.temporal.ChronoUnit;
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
        // Anchor the allowance cycle on the account's creation date so the count
        // reflects the user's actual schedule, not an arbitrary calendar boundary.
        LocalDate anchor = user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : today;
        int daysUntilNextAllowance = calculateDaysUntilNextAllowance(user.getAllowanceSchedule(), today, anchor);

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

    /**
     * Days until the user's next allowance payout, driven by their schedule and
     * an anchor date (the start of their allowance cycle). Returns the full
     * period when today is itself a payout day (the *next* one is a period away).
     *
     *   DAILY    -> 1
     *   WEEKLY   -> 1..7   (period of 7 from the anchor)
     *   BIWEEKLY -> 1..14  (period of 14 from the anchor)
     *   MONTHLY  -> next occurrence of the anchor's day-of-month
     */
    private int calculateDaysUntilNextAllowance(AllowanceSchedule schedule, LocalDate today, LocalDate anchor) {
        if (schedule == AllowanceSchedule.DAILY) {
            return 1;
        }
        if (schedule == AllowanceSchedule.WEEKLY) {
            return daysIntoPeriodRemaining(anchor, today, 7);
        }
        if (schedule == AllowanceSchedule.BIWEEKLY) {
            return daysIntoPeriodRemaining(anchor, today, 14);
        }
        // MONTHLY (also the default when schedule is null): same day-of-month next cycle.
        return monthlyDaysUntilNext(anchor, today);
    }

    /** For a fixed-length cycle: days remaining until the next multiple of {@code period} from the anchor. */
    private int daysIntoPeriodRemaining(LocalDate anchor, LocalDate today, int period) {
        long elapsed = ChronoUnit.DAYS.between(anchor, today);
        // Normalize into [0, period) even if today is before the anchor.
        long into = ((elapsed % period) + period) % period;
        return (int) (period - into); // into==0 (a payout day) -> a full period until the next
    }

    /** Days until the next occurrence of the anchor's day-of-month (clamped to short months). */
    private int monthlyDaysUntilNext(LocalDate anchor, LocalDate today) {
        int targetDom = anchor.getDayOfMonth();
        LocalDate thisMonth = today.withDayOfMonth(Math.min(targetDom, today.lengthOfMonth()));
        LocalDate next = thisMonth.isAfter(today)
                ? thisMonth
                : today.plusMonths(1).withDayOfMonth(
                        Math.min(targetDom, today.plusMonths(1).lengthOfMonth()));
        return (int) ChronoUnit.DAYS.between(today, next);
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
