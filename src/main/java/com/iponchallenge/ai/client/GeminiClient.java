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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thin client for Google Gemini's {@code generateContent} REST endpoint, with
 * optional function calling. Uses the JDK HTTP client + Jackson (no extra
 * dependency). The API key is sent in the {@code x-goog-api-key} header so it
 * never lands in access logs. Failures surface as {@link AiUnavailableException}.
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

    /** Plain text generation (no tools). */
    public String generate(String systemInstruction, String userPrompt, int maxOutputTokens) {
        JsonNode candidate = sendAndGetCandidate(baseBody(systemInstruction, userPrompt, maxOutputTokens));
        String text = firstText(candidate);
        if (text == null || text.isEmpty()) {
            throw new AiUnavailableException("The AI returned an empty reply. Please try again.");
        }
        return text;
    }

    /**
     * Generation with function calling. Returns either the model's text reply or
     * the function call it chose. {@code functionDeclarations} is the Gemini
     * tool schema list.
     */
    public GeminiResult generateWithTools(String systemInstruction, String userPrompt,
                                          Object functionDeclarations, int maxOutputTokens) {
        Map<String, Object> body = baseBody(systemInstruction, userPrompt, maxOutputTokens);
        body.put("tools", List.of(Map.of("functionDeclarations", functionDeclarations)));
        body.put("toolConfig", Map.of("functionCallingConfig", Map.of("mode", "AUTO")));

        JsonNode candidate = sendAndGetCandidate(body);
        JsonNode parts = candidate.path("content").path("parts");
        if (parts.isArray()) {
            for (JsonNode part : parts) {
                JsonNode call = part.path("functionCall");
                if (!call.isMissingNode() && call.has("name")) {
                    return GeminiResult.ofCall(call.path("name").asText(), call.path("args"));
                }
            }
        }
        String text = firstText(candidate);
        return GeminiResult.ofText(text == null || text.isEmpty()
                ? "I'm not sure how to help with that — could you rephrase?" : text);
    }

    // --- internals ---

    private Map<String, Object> baseBody(String systemInstruction, String userPrompt, int maxOutputTokens) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        body.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))));
        body.put("generationConfig", Map.of("maxOutputTokens", maxOutputTokens, "temperature", 0.7));
        return body;
    }

    /** Sends the request, validates status, and returns candidate[0]. */
    private JsonNode sendAndGetCandidate(Map<String, Object> body) {
        try {
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
                log.warn("Gemini API HTTP {} (model={}): {}", response.statusCode(), aiConfig.getModel(),
                        extractError(response.body()));
                throw new AiUnavailableException(switch (response.statusCode()) {
                    case 400 -> "The AI request was rejected. Try a shorter message.";
                    case 401, 403 -> "AI key was rejected. Check the AI_API_KEY setting.";
                    case 404 -> "AI model not found. Check the AI_MODEL setting.";
                    case 429 -> "The AI is busy right now (quota reached). Please try again shortly.";
                    default -> "The AI provider returned an error. Please try again later.";
                });
            }

            JsonNode candidate = objectMapper.readTree(response.body()).path("candidates").path(0);
            if (candidate.isMissingNode()) {
                throw new AiUnavailableException("The AI couldn't generate a reply. Try rephrasing your question.");
            }
            return candidate;
        } catch (AiUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            throw new AiUnavailableException("Couldn't reach the AI right now. Please try again in a moment.");
        }
    }

    /** First text part of a candidate, or null. */
    private static String firstText(JsonNode candidate) {
        JsonNode parts = candidate.path("content").path("parts");
        if (parts.isArray()) {
            for (JsonNode part : parts) {
                JsonNode text = part.path("text");
                if (text.isTextual() && !text.asText().isBlank()) {
                    return text.asText().trim();
                }
            }
        }
        return null;
    }

    /** Pulls Gemini's {@code error.message} from an error body for clearer logs. */
    private String extractError(String body) {
        try {
            String msg = objectMapper.readTree(body).path("error").path("message").asText("");
            return msg.isBlank() ? truncate(body) : msg;
        } catch (Exception e) {
            return truncate(body);
        }
    }

    private static String truncate(String s) {
        if (s == null) return "";
        return s.length() > 300 ? s.substring(0, 300) + "..." : s;
    }
}
