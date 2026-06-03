package com.iponchallenge.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Reads AI provider credentials from environment variables.
 *
 * SECURITY: API keys must NEVER be hardcoded. They must be injected via
 * environment variables on the hosting platform (Railway → Variables tab).
 *
 * Required env vars when AI features are enabled:
 *   AI_API_KEY   — API key for the AI provider (Anthropic / OpenAI)
 *   AI_MODEL     — Model identifier, e.g. "claude-sonnet-4-6" (optional, has default)
 *
 * TODO (Sprint 11+):
 *  - Add RestTemplate / HttpClient bean for calling the AI provider
 *  - Add retry + circuit breaker for AI call failures
 *  - Add token budget limit per user per day
 */
@Configuration
public class AiConfig {

    @Value("${AI_API_KEY:NOT_SET}")
    private String apiKey;

    @Value("${AI_MODEL:claude-haiku-4-5-20251001}")
    private String model;

    public boolean isEnabled() {
        return !"NOT_SET".equals(apiKey) && !apiKey.isBlank();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getModel() {
        return model;
    }
}
