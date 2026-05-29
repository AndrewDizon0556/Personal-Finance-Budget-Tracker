package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class SavingsGoalResponse {

    private UUID id;
    private String goalName;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private double progressPercentage;
    private boolean completed;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate targetDate;

    private LocalDateTime createdAt;
}
