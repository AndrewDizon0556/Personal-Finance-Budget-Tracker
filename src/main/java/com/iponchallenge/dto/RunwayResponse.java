package com.iponchallenge.dto;

import com.iponchallenge.entity.RunwayStatus;
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
public class RunwayResponse {

    private BigDecimal remainingBalance;
    private BigDecimal avgDailySpending;
    private int estimatedDaysRemaining;
    private int daysUntilNextAllowance;
    private RunwayStatus runwayStatus;
    private String message;
}
