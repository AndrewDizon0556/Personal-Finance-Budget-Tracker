package com.iponchallenge.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiCoachResponse {

    private String reply;        // AI-generated text
    private String type;         // echoed from request
    private int tokensUsed;      // for usage tracking (future)
    private String model;        // model used (e.g. "gemini-2.5-flash-lite")

    // When set, the AI is PROPOSING a change that needs the user's confirmation
    // (posted back to /api/ai/action). Null for plain advice replies.
    private ProposedAction action;
}
