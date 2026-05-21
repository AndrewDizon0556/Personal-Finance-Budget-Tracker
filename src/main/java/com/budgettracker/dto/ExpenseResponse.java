package com.budgettracker.dto;

import com.budgettracker.entity.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ExpenseResponse {
    private UUID id;
    private BigDecimal amount;
    private ExpenseCategory category;
    private String notes;
    private LocalDate date;

    public ExpenseResponse(UUID id, BigDecimal amount, ExpenseCategory category, String notes, LocalDate date) {
        this.id = id;
        this.amount = amount;
        this.category = category;
        this.notes = notes;
        this.date = date;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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
