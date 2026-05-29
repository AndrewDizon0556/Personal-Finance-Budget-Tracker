package com.iponchallenge.mapper;

import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .categoryId(expense.getCategory() != null ? expense.getCategory().getId() : null)
                .categoryName(expense.getCategory() != null ? expense.getCategory().getName() : "Uncategorized")
                .amount(expense.getAmount())
                .notes(expense.getNotes())
                .expenseDate(expense.getExpenseDate())
                .transactionType(expense.getTransactionType())
                .createdAt(expense.getCreatedAt())
                .build();
    }
}
