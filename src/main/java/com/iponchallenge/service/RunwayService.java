package com.iponchallenge.service;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.Expense;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class RunwayService {

    private static final int LOOKBACK_DAYS = 30;

    // A single purchase larger than this fraction of the allowance is treated as a
    // one-off (tuition, a gadget, a big transport cost) and excluded from the daily
    // spending pace, so it doesn't crash the runway estimate.
    private static final BigDecimal ONE_OFF_ALLOWANCE_FRACTION = new BigDecimal("0.40");

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
        // Income raises the wallet just as it does on the dashboard. The runway MUST use
        // the same remaining-balance formula (allowance + income − expenses); computing it
        // from allowance alone made a large income divide a tiny balance → "0 days" runway.
        BigDecimal totalIncome = expenseRepository.sumByUserAndDateBetweenAndType(
                user, startOfMonth, endOfMonth, TransactionType.INCOME
        );

        BigDecimal allowance = user.getMonthlyAllowance() != null
                ? user.getMonthlyAllowance() : BigDecimal.ZERO;
        BigDecimal remainingBalance = allowance.add(totalIncome).subtract(totalSpent);

        BigDecimal avgDailySpending = calculateAvgDailySpending(user, today);
        int estimatedDaysRemaining = calculateEstimatedDays(remainingBalance, avgDailySpending);
        // Anchor the allowance cycle on the account's creation date so the count
        // reflects the user's actual schedule, not an arbitrary calendar boundary.
        LocalDate anchor = user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate() : today;
        int daysUntilNextAllowance = calculateDaysUntilNextAllowance(user.getAllowanceSchedule(), today, anchor);

        RunwayStatus status = determineStatus(remainingBalance, estimatedDaysRemaining, daysUntilNextAllowance);
        String message = buildMessage(status, estimatedDaysRemaining, remainingBalance);

        return RunwayResponse.builder()
                .remainingBalance(remainingBalance)
                .avgDailySpending(avgDailySpending)
                .estimatedDaysRemaining(estimatedDaysRemaining)
                .daysUntilNextAllowance(daysUntilNextAllowance)
                .runwayStatus(status)
                .message(message)
                .build();
    }

    /**
     * Average "everyday" spending per day over the lookback window.
     *
     * One-off large purchases (tuition, a gadget, a big transport cost) are excluded
     * so a single exceptional expense isn't mistaken for a daily habit — otherwise the
     * runway crashes to a few days even when plenty of money remains.
     */
    private BigDecimal calculateAvgDailySpending(User user, LocalDate today) {
        LocalDate lookbackStart = today.minusDays(LOOKBACK_DAYS);

        List<Expense> expenses = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, lookbackStart, today)
                .stream()
                .filter(e -> e.getTransactionType() == TransactionType.EXPENSE)
                .toList();

        if (expenses.isEmpty()) return BigDecimal.ZERO;

        // Threshold above which an expense counts as a one-off (only when an allowance is set).
        BigDecimal allowance = user.getMonthlyAllowance() != null
                ? user.getMonthlyAllowance() : BigDecimal.ZERO;
        BigDecimal oneOffThreshold = allowance.compareTo(BigDecimal.ZERO) > 0
                ? allowance.multiply(ONE_OFF_ALLOWANCE_FRACTION)
                : null; // no allowance configured → don't exclude anything

        BigDecimal everydayTotal = expenses.stream()
                .map(Expense::getAmount)
                .filter(amount -> oneOffThreshold == null || amount.compareTo(oneOffThreshold) <= 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return everydayTotal.divide(BigDecimal.valueOf(LOOKBACK_DAYS), 2, RoundingMode.HALF_UP);
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

    private RunwayStatus determineStatus(BigDecimal remaining, int estimated, int daysUntilNext) {
        // Overspent: the wallet is already in the red, regardless of schedule.
        if (remaining.compareTo(BigDecimal.ZERO) < 0) return RunwayStatus.CRITICAL;
        if (estimated >= daysUntilNext) return RunwayStatus.SAFE;
        if (estimated >= daysUntilNext / 2) return RunwayStatus.WARNING;
        return RunwayStatus.CRITICAL;
    }

    private String buildMessage(RunwayStatus status, int estimatedDays, BigDecimal remaining) {
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            return "Your spending has exceeded your allowance. Reduce expenses to recover your budget.";
        }
        return switch (status) {
            case SAFE -> "You're on track! Your allowance should last until the next payout.";
            case WARNING -> "Heads up! Your allowance may run out in " + estimatedDays + " days.";
            case CRITICAL -> "Critical! Your allowance may run out in " + estimatedDays + " days. Spend carefully.";
        };
    }
}
