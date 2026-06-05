package com.iponchallenge.ai.client;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Outcome of a Gemini call: either a plain {@code text} reply, or a
 * {@code functionCall} (name + args) the model wants to invoke.
 */
public record GeminiResult(String text, String functionName, JsonNode args) {

    public boolean isFunctionCall() {
        return functionName != null && !functionName.isBlank();
    }

    public static GeminiResult ofText(String text) {
        return new GeminiResult(text, null, null);
    }

    public static GeminiResult ofCall(String name, JsonNode args) {
        return new GeminiResult(null, name, args);
    }
}
