package com.iponchallenge.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SplitBillRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title is too long")
    private String title;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Total amount is too large")
    private BigDecimal totalAmount;

    @NotNull(message = "Member count is required")
    @Min(value = 2, message = "Must have at least 2 members to split a bill")
    @Max(value = 1000, message = "That's too many members for one bill")
    private Integer memberCount;
}
