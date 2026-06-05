package com.iponchallenge.ai.exception;

/**
 * Thrown when the AI provider cannot be reached or returns an unusable response.
 * Callers translate this into a friendly, non-fatal message for the user.
 */
public class AiUnavailableException extends RuntimeException {
    public AiUnavailableException(String message) {
        super(message);
    }
}
