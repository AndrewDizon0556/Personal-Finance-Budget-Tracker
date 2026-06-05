package com.iponchallenge.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iponchallenge.ai.config.AiConfig;
import com.iponchallenge.ai.exception.AiUnavailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Thin client for Google Gemini's {@code generateContent} REST endpoint.
 *
 * Uses the JDK HTTP client + Jackson (already on the classpath) — no extra
 * dependency. The API key is sent in the {@code x-goog-api-key} header (never in
 * the URL, so it can't leak into access logs). Any failure surfaces as an
 * {@link AiUnavailableException} so callers can degrade gracefully.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final AiConfig aiConfig;
    private final ObjectMapper objectMapper;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Sends a prompt to Gemini and returns the generated text.
     *
     * @param systemInstruction high-level persona / rules for the model
     * @param userPrompt        the actual user-facing request (+ any context)
     * @param maxOutputTokens   cap on the response length (controls cost/latency)
     */
    public String generate(String systemInstruction, String userPrompt, int maxOutputTokens) {
        try {
            Map<String, Object> body = Map.of(
                    "system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", userPrompt))
                    )),
                    "generationConfig", Map.of(
                            "maxOutputTokens", maxOutputTokens,
                            "temperature", 0.7
                    )
            );

            String url = aiConfig.getBaseUrl() + "/models/" + aiConfig.getModel() + ":generateContent";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", aiConfig.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Gemini API returned HTTP {}: {}", response.statusCode(), truncate(response.body()));
                throw new AiUnavailableException("The AI provider returned an error. Please try again later.");
            }

            JsonNode parts = objectMapper.readTree(response.body())
                    .path("candidates").path(0).path("content").path("parts");

            if (!parts.isArray() || parts.isEmpty()) {
                log.warn("Gemini returned no content for the request.");
                throw new AiUnavailableException("The AI couldn't generate a reply. Try rephrasing your question.");
            }

            String text = parts.path(0).path("text").asText("").trim();
            if (text.isEmpty()) {
                throw new AiUnavailableException("The AI returned an empty reply. Please try again.");
            }
            return text;

        } catch (AiUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            throw new AiUnavailableException("Couldn't reach the AI right now. Please try again in a moment.");
        }
    }

    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }
}
