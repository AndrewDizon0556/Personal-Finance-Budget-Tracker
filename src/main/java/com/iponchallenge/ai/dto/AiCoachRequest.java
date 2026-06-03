package com.iponchallenge.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiCoachRequest {

    // e.g. "budget_advice" | "categorize_expense" | "tutor_question"
    @NotBlank(message = "Request type is required")
    private String type;

    // Free-text input from the user (question, expense description, etc.)
    @NotBlank(message = "Input is required")
    @Size(max = 1000, message = "Input must be 1000 characters or fewer")
    private String input;

    // Optional context passed from the client (e.g. current month's summary)
    private String context;
}
