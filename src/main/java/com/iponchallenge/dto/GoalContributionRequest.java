package com.iponchallenge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Body for "Add Money" — the amount to move from the wallet into a savings goal. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoalContributionRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Amount is too large")
    private BigDecimal amount;
}
