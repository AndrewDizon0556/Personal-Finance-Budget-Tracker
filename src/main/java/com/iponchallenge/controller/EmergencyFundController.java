package com.iponchallenge.controller;

import com.iponchallenge.dto.EmergencyFundRequest;
import com.iponchallenge.dto.EmergencyFundResponse;
import com.iponchallenge.service.EmergencyFundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency-fund")
@RequiredArgsConstructor
public class EmergencyFundController {

    private final EmergencyFundService fundService;

    @GetMapping
    public ResponseEntity<List<EmergencyFundResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(fundService.getFunds(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyFundResponse> getOne(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(fundService.getFund(auth.getName(), id));
    }

    @PostMapping
    public ResponseEntity<EmergencyFundResponse> create(
            @Valid @RequestBody EmergencyFundRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fundService.createFund(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyFundResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody EmergencyFundRequest request,
            Authentication auth) {
        return ResponseEntity.ok(fundService.updateFund(auth.getName(), id, request));
    }

    @PostMapping("/{id}/contribute")
    public ResponseEntity<EmergencyFundResponse> contribute(
            @PathVariable UUID id,
            @RequestBody Map<String, BigDecimal> body,
            Authentication auth) {
        BigDecimal amount = body.get("amount");
        return ResponseEntity.ok(fundService.contribute(auth.getName(), id, amount));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        fundService.deleteFund(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
