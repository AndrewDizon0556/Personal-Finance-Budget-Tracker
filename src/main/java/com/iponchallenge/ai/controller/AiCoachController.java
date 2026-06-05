package com.iponchallenge.ai.controller;

import com.iponchallenge.ai.config.AiConfig;
import com.iponchallenge.ai.dto.AiCoachRequest;
import com.iponchallenge.ai.dto.ProposedAction;
import com.iponchallenge.ai.exception.AiUnavailableException;
import com.iponchallenge.ai.service.AiActionService;
import com.iponchallenge.ai.service.AiCoachService;
import com.iponchallenge.ai.service.AiRateLimiter;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * AI Coach endpoints (Google Gemini). All endpoints require authentication
 * (enforced by SecurityConfig) and the per-user daily cap in {@link AiRateLimiter}.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiCoachController {

    private final AiConfig aiConfig;
    private final AiCoachService aiCoachService;
    private final AiActionService aiActionService;
    private final AiRateLimiter rateLimiter;

    /** Lets the client show/hide the AI Coach button based on whether it's configured. */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of("enabled", aiConfig.isEnabled()));
    }

    @PostMapping("/coach")
    public ResponseEntity<?> coach(@Valid @RequestBody AiCoachRequest request, Authentication auth) {
        if (!aiConfig.isEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "The AI Coach isn't set up yet."));
        }
        if (!rateLimiter.tryAcquire(auth.getName())) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message",
                            "You've reached today's AI limit (" + rateLimiter.dailyLimit() + " requests). Try again tomorrow."));
        }
        try {
            return ResponseEntity.ok(aiCoachService.coach(auth.getName(), request));
        } catch (AiUnavailableException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Executes a previously-proposed action AFTER the user confirms it. Every
     * field is re-validated and scoped to the authenticated user; the AI is not
     * involved here.
     */
    @PostMapping("/action")
    public ResponseEntity<?> action(@RequestBody ProposedAction action, Authentication auth) {
        if (!aiConfig.isEnabled()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "The AI Coach isn't set up yet."));
        }
        try {
            String message = aiActionService.execute(auth.getName(), action);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (BadRequestException | ResourceNotFoundException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("message", "Couldn't complete that action. Please try again."));
        }
    }
}
