package com.iponchallenge.controller;

import com.iponchallenge.dto.LessonResponse;
import com.iponchallenge.dto.UserProgressResponse;
import com.iponchallenge.service.FinancialLiteracyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/financial-lessons")
@RequiredArgsConstructor
public class FinancialLiteracyController {

    private final FinancialLiteracyService financialLiteracyService;

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(Authentication auth) {
        return ResponseEntity.ok(financialLiteracyService.getLessons(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonResponse> getLesson(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(financialLiteracyService.getLesson(auth.getName(), id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<LessonResponse> completeLesson(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Integer> body,
            Authentication auth) {
        Integer score = body != null ? body.get("score") : null;
        return ResponseEntity.ok(financialLiteracyService.completeLesson(auth.getName(), id, score));
    }

    @GetMapping("/progress")
    public ResponseEntity<UserProgressResponse> getProgress(Authentication auth) {
        return ResponseEntity.ok(financialLiteracyService.getUserProgress(auth.getName()));
    }
}
