package com.budgettracker.service;

import com.budgettracker.entity.AllowanceSchedule;
import com.budgettracker.entity.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class SurvivalBudgetStrategy implements BudgetStrategy {
    @Override
    public BigDecimal calculate(User user) {
        if (user == null || user.getMonthlyAllowance() == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal allowance = user.getMonthlyAllowance();
        if (user.getSchedule() == AllowanceSchedule.WEEKLY) {
            return allowance.divide(BigDecimal.valueOf(4), 2, BigDecimal.ROUND_HALF_UP);
        }
        if (user.getSchedule() == AllowanceSchedule.BIWEEKLY) {
            return allowance.divide(BigDecimal.valueOf(2), 2, BigDecimal.ROUND_HALF_UP);
        }
        return allowance;
    }
}
