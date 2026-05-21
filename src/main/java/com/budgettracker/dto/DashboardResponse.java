package com.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DashboardResponse {
    private BigDecimal balance;
    private BigDecimal dailySafeSpend;
    private LocalDate nextAllowanceDate;
    private long runwayDays;
    private String runwayMessage;

    public DashboardResponse(BigDecimal balance, BigDecimal dailySafeSpend, LocalDate nextAllowanceDate, long runwayDays, String runwayMessage) {
        this.balance = balance;
        this.dailySafeSpend = dailySafeSpend;
        this.nextAllowanceDate = nextAllowanceDate;
        this.runwayDays = runwayDays;
        this.runwayMessage = runwayMessage;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getDailySafeSpend() {
        return dailySafeSpend;
    }

    public void setDailySafeSpend(BigDecimal dailySafeSpend) {
        this.dailySafeSpend = dailySafeSpend;
    }

    public LocalDate getNextAllowanceDate() {
        return nextAllowanceDate;
    }

    public void setNextAllowanceDate(LocalDate nextAllowanceDate) {
        this.nextAllowanceDate = nextAllowanceDate;
    }

    public long getRunwayDays() {
        return runwayDays;
    }

    public void setRunwayDays(long runwayDays) {
        this.runwayDays = runwayDays;
    }

    public String getRunwayMessage() {
        return runwayMessage;
    }

    public void setRunwayMessage(String runwayMessage) {
        this.runwayMessage = runwayMessage;
    }
}
