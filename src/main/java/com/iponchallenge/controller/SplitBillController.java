package com.iponchallenge.controller;

import com.iponchallenge.dto.SplitBillRequest;
import com.iponchallenge.dto.SplitBillResponse;
import com.iponchallenge.service.SplitBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/split-bills")
@RequiredArgsConstructor
public class SplitBillController {

    private final SplitBillService splitBillService;

    @GetMapping
    public ResponseEntity<List<SplitBillResponse>> getSplitBills(Authentication auth) {
        return ResponseEntity.ok(splitBillService.getSplitBills(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SplitBillResponse> createSplitBill(
            @Valid @RequestBody SplitBillRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(splitBillService.createSplitBill(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SplitBillResponse> updateSplitBill(
            @PathVariable UUID id,
            @Valid @RequestBody SplitBillRequest request,
            Authentication auth) {
        return ResponseEntity.ok(splitBillService.updateSplitBill(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSplitBill(@PathVariable UUID id, Authentication auth) {
        splitBillService.deleteSplitBill(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
