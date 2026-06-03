package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyFundResponse {

    private UUID id;
    private String name;
    private String category;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private double progressPercentage;
    private BigDecimal remaining;
    private boolean funded; // currentAmount >= targetAmount
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
