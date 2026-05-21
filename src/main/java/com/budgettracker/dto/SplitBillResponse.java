package com.budgettracker.dto;

import java.math.BigDecimal;

public class SplitBillResponse {
    private BigDecimal eachPays;

    public SplitBillResponse(BigDecimal eachPays) {
        this.eachPays = eachPays;
    }

    public BigDecimal getEachPays() {
        return eachPays;
    }

    public void setEachPays(BigDecimal eachPays) {
        this.eachPays = eachPays;
    }
}
