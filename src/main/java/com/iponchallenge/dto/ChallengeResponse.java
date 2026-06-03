package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeResponse {

    private UUID id;
    private String title;
    private String description;
    private int targetDays;
    private int rewardXp;
    private String type;
    private BigDecimal targetAmount;
    private boolean active;

    // Populated when the requesting user has joined this challenge
    private boolean joined;
    private boolean completed;
    private int currentProgress;
    private double progressPercentage;
    private LocalDate startDate;
    private LocalDate completedAt;
}
