package com.iponchallenge.ai.service;

import org.springframework.stereotype.Service;

/**
 * AI Coach — placeholder for future integration.
 *
 * TODO (Sprint 10+):
 *  - Wire up Anthropic / OpenAI API via AiConfig (reads API key from env, never hardcoded)
 *  - Implement getBudgetAdvice(): analyse spending and generate personalised advice
 *  - Implement categorizExpense(): auto-assign category from description text
 *  - Implement getFinancialTutor(): answer student finance questions
 *  - Add prompt templates in ai/prompts/
 *  - Add rate limiting and token-usage tracking
 *
 * Security: API key must be injected via @Value("${AI_API_KEY}") from environment.
 *           Never hardcode keys in source code.
 */
@Service
public class AiCoachService {

    public String getBudgetAdvice(String email) {
        // TODO: build prompt from user's spending data and call AI API
        throw new UnsupportedOperationException("AI Coach not yet implemented");
    }

    public String categorizeExpense(String description) {
        // TODO: call AI API to classify expense description into a category
        throw new UnsupportedOperationException("AI Coach not yet implemented");
    }

    public String getFinancialTutor(String question) {
        // TODO: student finance Q&A — answer using a system prompt + user question
        throw new UnsupportedOperationException("AI Coach not yet implemented");
    }
}
