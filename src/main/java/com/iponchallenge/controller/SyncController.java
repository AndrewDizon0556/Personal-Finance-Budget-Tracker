package com.iponchallenge.controller;

import com.iponchallenge.dto.SyncRequestDto;
import com.iponchallenge.dto.SyncResponseDto;
import com.iponchallenge.service.SyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SyncService syncService;

    @PostMapping
    public ResponseEntity<SyncResponseDto> sync(
            @Valid @RequestBody SyncRequestDto request,
            Authentication auth) {
        return ResponseEntity.ok(syncService.sync(auth.getName(), request));
    }
}
