package com.budgettracker.controller;

import com.budgettracker.dto.SplitBillRequest;
import com.budgettracker.dto.SplitBillResponse;
import com.budgettracker.service.SplitBillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/split-bill")
public class SplitBillController {
    private final SplitBillService splitBillService;

    public SplitBillController(SplitBillService splitBillService) {
        this.splitBillService = splitBillService;
    }

    @PostMapping
    public ResponseEntity<SplitBillResponse> splitBill(@Valid @RequestBody SplitBillRequest request) {
        return ResponseEntity.ok(splitBillService.split(request.getTotalAmount(), request.getMembers()));
    }
}
