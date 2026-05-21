package com.budgettracker.service;

import com.budgettracker.entity.User;
import java.math.BigDecimal;

public interface BudgetStrategy {
    BigDecimal calculate(User user);
}
