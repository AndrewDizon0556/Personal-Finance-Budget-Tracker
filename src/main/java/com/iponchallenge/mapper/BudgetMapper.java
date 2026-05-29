package com.iponchallenge.mapper;

import com.iponchallenge.dto.BudgetResponse;
import com.iponchallenge.entity.Budget;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {

    public BudgetResponse toResponse(Budget budget) {
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .budgetAmount(budget.getBudgetAmount())
                .remainingBudget(budget.getRemainingBudget())
                .spentAmount(budget.getBudgetAmount().subtract(budget.getRemainingBudget()))
                .month(budget.getMonth())
                .year(budget.getYear())
                .build();
    }
}
