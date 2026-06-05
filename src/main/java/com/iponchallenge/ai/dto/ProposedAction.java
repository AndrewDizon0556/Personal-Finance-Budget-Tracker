package com.iponchallenge.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * A change the AI Coach proposes but has NOT executed. Returned to the client so
 * the user can confirm; on confirm it is posted back to /api/ai/action, where it
 * is re-validated and executed via the normal business services. The AI never
 * writes to the database directly.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProposedAction {

    /** ADD_TRANSACTION or CREATE_GOAL. */
    private String type;

    // --- ADD_TRANSACTION ---
    private String transactionType; // INCOME | EXPENSE
    private BigDecimal amount;
    private String category;
    private String notes;
    private String date; // yyyy-MM-dd

    // --- CREATE_GOAL ---
    private String goalName;
    private BigDecimal targetAmount;
    private String targetDate; // yyyy-MM-dd

    /** Human-readable confirmation shown to the user. */
    private String summary;
}
