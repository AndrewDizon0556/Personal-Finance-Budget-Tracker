package com.iponchallenge.service;

import com.iponchallenge.dto.AnalyticsResponse;
import com.iponchallenge.dto.InsightDto;
import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.RunwayStatus;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Generates short, student-friendly financial insights from real spending data.
 */
@Service
@RequiredArgsConstructor
public class InsightsService {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final AnalyticsService analyticsService;
    private final RunwayService runwayService;

    public List<InsightDto> getForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<InsightDto> insights = new ArrayList<>();
        AnalyticsResponse analytics = analyticsService.getAnalytics(email);
        RunwayResponse runway = runwayService.getRunway(email);

        // 1. Allowance usage
        BigDecimal allowance = user.getMonthlyAllowance();
        if (allowance != null && allowance.compareTo(BigDecimal.ZERO) > 0) {
            double spentPct = analytics.getTotalSpentThisMonth()
                    .divide(allowance, 4, java.math.RoundingMode.HALF_UP)
                    .doubleValue() * 100;
            if (spentPct >= 85) {
                insights.add(new InsightDto("warning",
                        "You're close to exceeding your allowance this month. Ease up on spending."));
            } else if (spentPct <= 50) {
                insights.add(new InsightDto("positive",
                        "Great job staying well under your budget so far. Keep it up!"));
            }
        }

        // 2. Week-over-week trend
        LocalDate today = LocalDate.now();
        LocalDate thisWeekStart = today.with(DayOfWeek.MONDAY);
        LocalDate lastWeekStart = thisWeekStart.minusWeeks(1);
        LocalDate lastWeekEnd = thisWeekStart.minusDays(1);

        BigDecimal thisWeek = expenseRepository.sumByUserAndDateBetweenAndType(
                user, thisWeekStart, today, TransactionType.EXPENSE);
        BigDecimal lastWeek = expenseRepository.sumByUserAndDateBetweenAndType(
                user, lastWeekStart, lastWeekEnd, TransactionType.EXPENSE);

        if (lastWeek.compareTo(BigDecimal.ZERO) > 0) {
            if (thisWeek.compareTo(lastWeek) < 0) {
                insights.add(new InsightDto("positive",
                        "Your spending is down compared to last week. Nice discipline!"));
            } else if (thisWeek.compareTo(lastWeek) > 0) {
                insights.add(new InsightDto("warning",
                        "You're spending more than last week. Keep an eye on it."));
            }
        }

        // 3. Top category
        if (analytics.getHighestSpendingCategory() != null) {
            insights.add(new InsightDto("info",
                    analytics.getHighestSpendingCategory() + " is your biggest spending category this month."));
        }

        // 4. Runway outlook
        if (runway.getRunwayStatus() == RunwayStatus.CRITICAL) {
            insights.add(new InsightDto("warning",
                    "Your funds may run out before your next allowance. Spend carefully."));
        } else if (runway.getRunwayStatus() == RunwayStatus.SAFE
                && runway.getEstimatedDaysRemaining() >= runway.getDaysUntilNextAllowance()) {
            insights.add(new InsightDto("celebrate",
                    "Your money will comfortably last until your next allowance. 🎉"));
        }

        return insights.size() > 4 ? insights.subList(0, 4) : insights;
    }
}
