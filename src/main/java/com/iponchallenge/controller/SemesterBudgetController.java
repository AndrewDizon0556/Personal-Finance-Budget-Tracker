package com.iponchallenge.controller;

import com.iponchallenge.dto.SemesterBudgetRequest;
import com.iponchallenge.dto.SemesterBudgetResponse;
import com.iponchallenge.dto.WeeklyBreakdownResponse;
import com.iponchallenge.service.SemesterBudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/semester-budget")
@RequiredArgsConstructor
public class SemesterBudgetController {

    private final SemesterBudgetService semesterBudgetService;

    @GetMapping
    public ResponseEntity<List<SemesterBudgetResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(semesterBudgetService.getSemesterBudgets(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterBudgetResponse> getOne(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(semesterBudgetService.getSemesterBudget(auth.getName(), id));
    }

    @GetMapping("/{id}/weekly-breakdown")
    public ResponseEntity<List<WeeklyBreakdownResponse>> getWeeklyBreakdown(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(semesterBudgetService.getWeeklyBreakdown(auth.getName(), id));
    }

    @PostMapping
    public ResponseEntity<SemesterBudgetResponse> create(
            @Valid @RequestBody SemesterBudgetRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(semesterBudgetService.createSemesterBudget(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SemesterBudgetResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SemesterBudgetRequest request,
            Authentication auth) {
        return ResponseEntity.ok(semesterBudgetService.updateSemesterBudget(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        semesterBudgetService.deleteSemesterBudget(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
