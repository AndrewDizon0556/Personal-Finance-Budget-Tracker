package com.iponchallenge.service;

import com.iponchallenge.dto.AllowancePredictionResponse;
import com.iponchallenge.dto.AllowancePredictionResponse.WeeklyProjection;
import com.iponchallenge.dto.RunwayResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Enriches the single-source {@link RunwayService} data with a recommended daily
 * spend, an exhaustion date, a budget-health "spending trend", a smart tip, and a
 * 4-week projection. Everything derives from the same runway status, so the card,
 * Smart Insights, and Financial Health Score never disagree.
 */
@Service
@RequiredArgsConstructor
public class AllowancePredictionService {

    private final RunwayService runwayService;

    public AllowancePredictionResponse getPrediction(String email) {
        // getRunway is the single source of truth (and validates the user).
        RunwayResponse runway = runwayService.getRunway(email);
        LocalDate today = LocalDate.now();

        // Recommended daily spend to last until the next allowance.
        BigDecimal dailyRecommended = runway.getDaysUntilNextAllowance() > 0
                ? runway.getRemainingBalance()
                        .divide(BigDecimal.valueOf(runway.getDaysUntilNextAllowance()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        dailyRecommended = dailyRecommended.max(BigDecimal.ZERO);

        LocalDate exhaustionDate = runway.getEstimatedDaysRemaining() < 999
                ? today.plusDays(runway.getEstimatedDaysRemaining())
                : null;

        String trend = budgetTrend(runway);
        String riskLevel = switch (runway.getRunwayStatus()) {
            case SAFE     -> "GREEN";
            case WARNING  -> "YELLOW";
            case CRITICAL -> "RED";
        };
        String smartTip = buildSmartTip(runway, riskLevel, dailyRecommended);

        List<WeeklyProjection> projections = buildWeeklyProjections(
                runway.getRemainingBalance(), runway.getAvgDailySpending(), today, 4);

        return AllowancePredictionResponse.builder()
                .remainingBalance(runway.getRemainingBalance())
                .avgDailySpending(runway.getAvgDailySpending())
                .estimatedDaysRemaining(runway.getEstimatedDaysRemaining())
                .daysUntilNextAllowance(runway.getDaysUntilNextAllowance())
                .runwayStatus(runway.getRunwayStatus())
                .message(runway.getMessage())
                .dailyRecommendedSpending(dailyRecommended)
                .estimatedExhaustionDate(exhaustionDate)
                .riskLevel(riskLevel)
                .spendingTrend(trend)
                .smartTip(smartTip)
                .weeklyProjections(projections)
                .build();
    }

    /**
     * Budget-health trend (CRITICAL | HIGH_RISK | STABLE), derived from the same
     * runway status so it can never say "Stable" while the wallet is in the red.
     */
    private String budgetTrend(RunwayResponse runway) {
        if (runway.getRemainingBalance().compareTo(BigDecimal.ZERO) < 0) return "CRITICAL";
        return switch (runway.getRunwayStatus()) {
            case SAFE     -> "STABLE";
            case WARNING  -> "HIGH_RISK";
            case CRITICAL -> "CRITICAL";
        };
    }

    private String buildSmartTip(RunwayResponse runway, String risk, BigDecimal daily) {
        if (runway.getRemainingBalance().compareTo(BigDecimal.ZERO) < 0) {
            return "Your spending has exceeded your allowance. Reduce expenses or add income to recover your budget.";
        }
        if ("RED".equals(risk)) {
            return "At your current spending rate, your funds may run out before your next allowance. "
                    + "Keep spending under ₱" + daily.toPlainString() + "/day.";
        }
        if ("YELLOW".equals(risk)) {
            return "Your spending pace is a bit high. Aim for about ₱" + daily.toPlainString()
                    + "/day to stay on track.";
        }
        return "You're on track! Recommended spend: ₱" + daily.toPlainString() + "/day.";
    }

    private List<WeeklyProjection> buildWeeklyProjections(
            BigDecimal remaining, BigDecimal avgDaily, LocalDate today, int weeks) {

        List<WeeklyProjection> result = new ArrayList<>();
        BigDecimal balance = remaining;
        BigDecimal weeklySpend = avgDaily.multiply(BigDecimal.valueOf(7));

        for (int i = 0; i < weeks; i++) {
            LocalDate weekStart = today.plusDays((long) i * 7);
            BigDecimal projectedBalance = balance.subtract(weeklySpend);

            String status;
            if (projectedBalance.compareTo(BigDecimal.ZERO) <= 0) {
                status = "CRITICAL";
                projectedBalance = BigDecimal.ZERO;
            } else if (projectedBalance.compareTo(weeklySpend) < 0) {
                status = "WARNING";
            } else {
                status = "SAFE";
            }

            result.add(WeeklyProjection.builder()
                    .weekNumber(i + 1)
                    .weekStart(weekStart)
                    .projectedSpend(weeklySpend)
                    .projectedBalance(projectedBalance)
                    .status(status)
                    .build());

            balance = projectedBalance;
        }
        return result;
    }
}
