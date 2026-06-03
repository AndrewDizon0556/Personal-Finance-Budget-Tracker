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
public class SchoolEventResponse {

    private UUID id;
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String category;
    private BigDecimal estimatedCost;
    private String notes;
    private int daysUntil;        // computed — negative if past
    private boolean isUpcoming;   // within next 14 days
    private String budgetSuggestion; // non-null when upcoming + has cost
    private LocalDateTime createdAt;
}
