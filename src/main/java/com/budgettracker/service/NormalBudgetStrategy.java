package com.budgettracker.service;

import com.budgettracker.entity.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class NormalBudgetStrategy implements BudgetStrategy {
    @Override
    public BigDecimal calculate(User user) {
        if (user == null || user.getMonthlyAllowance() == null) {
            return BigDecimal.ZERO;
        }
        return user.getMonthlyAllowance();
    }
}
