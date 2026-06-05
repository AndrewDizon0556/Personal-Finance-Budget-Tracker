package com.iponchallenge.ai.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Reads AI provider credentials from environment variables.
 *
 * Default provider is Google Gemini (it has a free tier). The app calls Gemini's
 * REST API directly from {@code GeminiClient} — no SDK needed.
 *
 * SECURITY: API keys must NEVER be hardcoded. Inject them via environment
 * variables on the hosting platform (Railway -> Variables tab).
 *
 * Required env vars when AI features are enabled:
 *   AI_API_KEY  — Gemini API key (free from https://aistudio.google.com/app/apikey)
 *   AI_MODEL    — Gemini model id (optional; defaults to "gemini-2.5-flash-lite")
 *   AI_BASE_URL — API base (optional; defaults to the Gemini v1beta endpoint)
 */
@Getter
@Configuration
public class AiConfig {

    @Value("${AI_API_KEY:NOT_SET}")
    private String apiKey;

    // Fast, free-tier-friendly Gemini model. (gemini-2.0-flash was deprecated.)
    @Value("${AI_MODEL:gemini-2.5-flash-lite}")
    private String model;

    @Value("${AI_BASE_URL:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    /** True only when a real API key has been supplied. */
    public boolean isEnabled() {
        return !"NOT_SET".equals(apiKey) && apiKey != null && !apiKey.isBlank();
    }
}
