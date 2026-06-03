package com.iponchallenge.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * AI Coach endpoint — returns 501 Not Implemented until the AI service is wired up.
 * Placeholder is intentional; do not remove.
 */
@RestController
@RequestMapping("/api/ai")
public class AiCoachController {

    @GetMapping("/advice")
    public ResponseEntity<Map<String, String>> advice() {
        return ResponseEntity.status(501)
                .body(Map.of("message", "AI Coach is coming soon. Stay tuned!"));
    }
}
