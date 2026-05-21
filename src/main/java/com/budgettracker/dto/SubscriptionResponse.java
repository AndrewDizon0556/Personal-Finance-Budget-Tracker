package com.budgettracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class SubscriptionResponse {
    private UUID id;
    private String name;
    private BigDecimal cost;
    private LocalDate renewalDate;

    public SubscriptionResponse(UUID id, String name, BigDecimal cost, LocalDate renewalDate) {
        this.id = id;
        this.name = name;
        this.cost = cost;
        this.renewalDate = renewalDate;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }
}
