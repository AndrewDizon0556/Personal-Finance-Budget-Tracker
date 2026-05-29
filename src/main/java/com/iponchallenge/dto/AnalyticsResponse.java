package com.iponchallenge.dto;

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
public class AnalyticsResponse {

    private BigDecimal totalSpentThisMonth;
    private String highestSpendingCategory;
    private List<CategoryTotalDto> categoryTotals;
    private List<BigDecimal> weeklyTotals;
}
