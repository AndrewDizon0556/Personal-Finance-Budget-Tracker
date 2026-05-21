package com.budgettracker.dto;

import java.math.BigDecimal;
import java.util.Map;

public class CategoryTotalsResponse {
    private Map<String, BigDecimal> totals;

    public CategoryTotalsResponse(Map<String, BigDecimal> totals) {
        this.totals = totals;
    }

    public Map<String, BigDecimal> getTotals() {
        return totals;
    }

    public void setTotals(Map<String, BigDecimal> totals) {
        this.totals = totals;
    }
}
