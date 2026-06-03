package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseAdvisorResponse {

    private BigDecimal purchaseAmount;
    private BigDecimal dailyBudget;
    private BigDecimal spentToday;
    private BigDecimal remainingTodayBefore;
    private BigDecimal remainingTodayAfter;
    private double budgetImpactPercent; // how much of today's budget this uses
    private String risk;     // LOW | MEDIUM | HIGH
    private String advice;
    private boolean hasBudget; // false when user has no budget configured
}
