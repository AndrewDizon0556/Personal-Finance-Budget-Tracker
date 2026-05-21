package com.budgettracker.dto;

import com.budgettracker.entity.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {
    @NotNull(message = "amount is required")
    @Positive(message = "amount must be > 0")
    private BigDecimal amount;

    @NotNull(message = "category is required")
    private ExpenseCategory category;

    @NotBlank(message = "notes is required")
    private String notes;

    @NotNull(message = "date is required")
    private LocalDate date;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
