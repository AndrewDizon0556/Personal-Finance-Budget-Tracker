package com.iponchallenge.controller;

import com.iponchallenge.dto.HelpPreferenceRequest;
import com.iponchallenge.dto.HelpPreferenceResponse;
import com.iponchallenge.service.HelpPreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/help")
@RequiredArgsConstructor
public class HelpPreferenceController {

    private final HelpPreferenceService helpPreferenceService;

    @GetMapping("/preferences")
    public ResponseEntity<List<HelpPreferenceResponse>> getPreferences(Authentication auth) {
        return ResponseEntity.ok(helpPreferenceService.getPreferences(auth.getName()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<HelpPreferenceResponse> upsertPreference(
            @Valid @RequestBody HelpPreferenceRequest request, Authentication auth) {
        return ResponseEntity.ok(helpPreferenceService.upsert(auth.getName(), request));
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetAll(Authentication auth) {
        helpPreferenceService.resetAll(auth.getName());
        return ResponseEntity.noContent().build();
    }
}
