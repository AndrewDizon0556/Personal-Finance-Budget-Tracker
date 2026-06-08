package com.iponchallenge.entity;

public enum TransactionType {
    EXPENSE,
    INCOME,
    /** Money moved from the spendable wallet into a savings goal (not spending). */
    GOAL_CONTRIBUTION
}
