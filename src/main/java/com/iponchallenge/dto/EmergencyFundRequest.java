package com.iponchallenge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyFundRequest {

    @NotBlank(message = "Fund name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category; // MEDICAL | TRANSPORTATION | SCHOOL | GENERAL

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "1.00", message = "Target amount must be at least ₱1")
    @Digits(integer = 10, fraction = 2, message = "Amount is too large")
    private BigDecimal targetAmount;

    @DecimalMin(value = "0.00", message = "Current amount cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Amount is too large")
    private BigDecimal currentAmount;
}
