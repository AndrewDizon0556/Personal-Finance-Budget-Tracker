package com.budgettracker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class SplitBillRequest {
    @NotNull(message = "totalAmount is required")
    @Positive(message = "totalAmount must be > 0")
    private BigDecimal totalAmount;

    @NotNull(message = "members is required")
    @Min(value = 1, message = "members must be >= 1")
    private Integer members;

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getMembers() {
        return members;
    }

    public void setMembers(Integer members) {
        this.members = members;
    }
}
