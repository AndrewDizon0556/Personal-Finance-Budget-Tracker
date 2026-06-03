package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialHealthScoreResponse {

    private int score;           // 0–100
    private String level;        // POOR | FAIR | GOOD | EXCELLENT
    private String message;
    private String tip;
    private List<HealthFactor> factors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HealthFactor {
        private String name;
        private int points;
        private int maxPoints;
        private String status;   // POOR | FAIR | GOOD | EXCELLENT
        private String detail;
    }
}
