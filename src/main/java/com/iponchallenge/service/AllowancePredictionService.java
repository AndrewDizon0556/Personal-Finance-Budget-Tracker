package com.iponchallenge.service;

import com.iponchallenge.dto.AllowancePredictionResponse;
import com.iponchallenge.dto.AllowancePredictionResponse.WeeklyProjection;
import com.iponchallenge.dto.RunwayResponse;
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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AllowancePredictionService {

    private final RunwayService runwayService;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public AllowancePredictionResponse getPrediction(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        RunwayResponse runway = runwayService.getRunway(email);

        LocalDate today = LocalDate.now();

        // Recommended daily spend to last until next allowance
        BigDecimal dailyRecommended = runway.getDaysUntilNextAllowance() > 0
                ? runway.getRemainingBalance()
                        .divide(BigDecimal.valueOf(runway.getDaysUntilNextAllowance()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        dailyRecommended = dailyRecommended.max(BigDecimal.ZERO);

        // Exhaustion date
        LocalDate exhaustionDate = runway.getEstimatedDaysRemaining() < 999
                ? today.plusDays(runway.getEstimatedDaysRemaining())
                : null;

        // Spending trend: compare last-7 avg vs previous-7 avg
        String trend = computeSpendingTrend(user, today);

        // Risk level mapped from RunwayStatus
        String riskLevel = switch (runway.getRunwayStatus()) {
            case SAFE     -> "GREEN";
            case WARNING  -> "YELLOW";
            case CRITICAL -> "RED";
        };

        String smartTip = buildSmartTip(runway, riskLevel, trend, dailyRecommended);

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

    private String computeSpendingTrend(User user, LocalDate today) {
        BigDecimal last7 = expenseRepository.sumByUserAndDateBetweenAndType(
                user, today.minusDays(7), today, TransactionType.EXPENSE);
        BigDecimal prev7 = expenseRepository.sumByUserAndDateBetweenAndType(
                user, today.minusDays(14), today.minusDays(7), TransactionType.EXPENSE);

        if (prev7.compareTo(BigDecimal.ZERO) == 0) return "STABLE";

        BigDecimal diff = last7.subtract(prev7);
        BigDecimal threshold = prev7.multiply(new BigDecimal("0.10")); // 10% change threshold

        if (diff.compareTo(threshold) > 0)       return "INCREASING";
        if (diff.negate().compareTo(threshold) > 0) return "DECREASING";
        return "STABLE";
    }

    private String buildSmartTip(RunwayResponse runway, String risk, String trend, BigDecimal daily) {
        if ("RED".equals(risk)) {
            return "Your allowance may run out early. Try to keep spending under ₱"
                    + daily.toPlainString() + " per day.";
        }
        if ("YELLOW".equals(risk) && "INCREASING".equals(trend)) {
            return "Your spending is increasing. Cut back now to avoid running short before your next allowance.";
        }
        if ("GREEN".equals(risk) && "DECREASING".equals(trend)) {
            return "Great job! Your spending is decreasing. Consider moving some savings to your emergency fund.";
        }
        if ("GREEN".equals(risk)) {
            return "You're on track! Recommended spend: ₱" + daily.toPlainString() + "/day.";
        }
        return runway.getMessage();
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
