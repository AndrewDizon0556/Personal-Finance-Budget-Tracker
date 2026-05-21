package com.budgettracker.service;

import com.budgettracker.entity.Expense;
import com.budgettracker.entity.Subscription;
import jakarta.validation.constraints.NotNull;

public class TransactionFactory {
    public static Object create(@NotNull TransactionType type) {
        return switch (type) {
            case EXPENSE -> new Expense();
            case SUBSCRIPTION -> new Subscription();
            case SPLIT_BILL -> new Object();
        };
    }
}
