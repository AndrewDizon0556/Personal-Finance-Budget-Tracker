package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoalRequest {

    @NotBlank(message = "Goal name is required")
    private String goalName;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.01", message = "Target amount must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Target amount is too large")
    private BigDecimal targetAmount;

    @DecimalMin(value = "0.00", message = "Current amount cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Current amount is too large")
    private BigDecimal currentAmount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;
}
