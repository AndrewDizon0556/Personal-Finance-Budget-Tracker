package com.iponchallenge.controller;

import com.iponchallenge.dto.PurchaseAdvisorResponse;
import com.iponchallenge.service.PurchaseAdvisorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/advisor")
@RequiredArgsConstructor
public class PurchaseAdvisorController {

    private final PurchaseAdvisorService advisorService;

    @GetMapping("/check")
    public ResponseEntity<PurchaseAdvisorResponse> check(
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) UUID categoryId,
            Authentication auth) {
        return ResponseEntity.ok(advisorService.check(auth.getName(), amount, categoryId));
    }
}
