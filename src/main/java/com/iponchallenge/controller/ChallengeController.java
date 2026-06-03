package com.iponchallenge.controller;

import com.iponchallenge.dto.ChallengeResponse;
import com.iponchallenge.service.ChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(challengeService.getChallenges(auth.getName()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ChallengeResponse> join(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(challengeService.joinChallenge(auth.getName(), id));
    }

    @PostMapping("/{id}/progress")
    public ResponseEntity<ChallengeResponse> updateProgress(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(challengeService.updateProgress(auth.getName(), id));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leave(@PathVariable UUID id, Authentication auth) {
        challengeService.leaveChallenge(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
