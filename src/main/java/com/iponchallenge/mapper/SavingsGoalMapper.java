package com.iponchallenge.mapper;

import com.iponchallenge.dto.SavingsGoalResponse;
import com.iponchallenge.entity.SavingsGoal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class SavingsGoalMapper {

    public SavingsGoalResponse toResponse(SavingsGoal goal) {
        double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? goal.getCurrentAmount()
                        .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                        .doubleValue() * 100
                : 0.0;

        return SavingsGoalResponse.builder()
                .id(goal.getId())
                .goalName(goal.getGoalName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .progressPercentage(Math.min(progress, 100.0))
                .completed(goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0)
                .targetDate(goal.getTargetDate())
                .createdAt(goal.getCreatedAt())
                .build();
    }
}
