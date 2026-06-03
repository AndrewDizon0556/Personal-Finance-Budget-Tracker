package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iponchallenge.entity.RunwayStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllowancePredictionResponse {

    // Base runway data (reused from RunwayService)
    private BigDecimal remainingBalance;
    private BigDecimal avgDailySpending;
    private int estimatedDaysRemaining;
    private int daysUntilNextAllowance;
    private RunwayStatus runwayStatus;
    private String message;

    // Enhanced prediction data
    private BigDecimal dailyRecommendedSpending;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate estimatedExhaustionDate; // null if balance lasts indefinitely

    private String riskLevel;        // GREEN | YELLOW | RED
    private String spendingTrend;    // INCREASING | DECREASING | STABLE
    private String smartTip;

    // Weekly projections (up to 4 weeks)
    private List<WeeklyProjection> weeklyProjections;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeeklyProjection {
        private int weekNumber;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate weekStart;

        private BigDecimal projectedSpend;
        private BigDecimal projectedBalance;
        private String status; // SAFE | WARNING | CRITICAL
    }
}
