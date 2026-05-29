package com.iponchallenge.controller;

import com.iponchallenge.dto.ExpenseCategoryRequest;
import com.iponchallenge.dto.ExpenseCategoryResponse;
import com.iponchallenge.service.ExpenseCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ExpenseCategoryController {

    private final ExpenseCategoryService expenseCategoryService;

    @GetMapping
    public ResponseEntity<List<ExpenseCategoryResponse>> getCategories(Authentication auth) {
        return ResponseEntity.ok(expenseCategoryService.getCategories(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<ExpenseCategoryResponse> createCategory(
            @Valid @RequestBody ExpenseCategoryRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(expenseCategoryService.createCategory(auth.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id, Authentication auth) {
        expenseCategoryService.deleteCategory(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
