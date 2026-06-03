package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iponchallenge.entity.AllowanceSchedule;
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
public class SemesterBudgetRequest {

    @NotBlank(message = "Semester name is required")
    private String semesterName;

    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull(message = "Total budget is required")
    @DecimalMin(value = "1.00", message = "Total budget must be at least ₱1")
    @Digits(integer = 10, fraction = 2, message = "Total budget is too large")
    private BigDecimal totalBudget;

    @DecimalMin(value = "0.00", message = "Target savings cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Target savings is too large")
    private BigDecimal targetSavings;

    private AllowanceSchedule allowanceSchedule;
}
