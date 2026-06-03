package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iponchallenge.entity.AllowanceSchedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemesterBudgetResponse {

    private UUID id;
    private String semesterName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private BigDecimal totalBudget;
    private BigDecimal targetSavings;
    private AllowanceSchedule allowanceSchedule;

    // Computed fields
    private BigDecimal totalSpent;
    private BigDecimal remaining;
    private BigDecimal weeklyBudget;
    private int totalWeeks;
    private int weeksElapsed;
    private int weeksRemaining;
    private double progressPercentage;
    private String status;       // ON_TRACK, WARNING, CRITICAL, COMPLETED
    private String statusMessage;

    private LocalDateTime createdAt;
}
