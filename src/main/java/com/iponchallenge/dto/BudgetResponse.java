package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal budgetAmount;
    private BigDecimal remainingBudget;
    private BigDecimal spentAmount;
    private Integer month;
    private Integer year;
}
