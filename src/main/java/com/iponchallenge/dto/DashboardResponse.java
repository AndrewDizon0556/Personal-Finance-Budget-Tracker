package com.iponchallenge.dto;

import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.RunwayStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private BigDecimal monthlyAllowance;
    private AllowanceSchedule allowanceSchedule;
    private BigDecimal totalSpentThisMonth;
    private BigDecimal remainingBalance;
    private BigDecimal dailySafeSpend;
    private int daysLeftInMonth;
    private List<BudgetResponse> budgets;
    private List<ExpenseResponse> recentTransactions;

    // Runway predictor
    private RunwayStatus runwayStatus;
    private int estimatedDaysRemaining;
    private int daysUntilNextAllowance;
    private String runwayMessage;
}
