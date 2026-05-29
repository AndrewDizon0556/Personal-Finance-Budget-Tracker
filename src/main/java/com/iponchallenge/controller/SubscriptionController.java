package com.iponchallenge.controller;

import com.iponchallenge.dto.SubscriptionRequest;
import com.iponchallenge.dto.SubscriptionResponse;
import com.iponchallenge.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptions(Authentication auth) {
        return ResponseEntity.ok(subscriptionService.getSubscriptions(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody SubscriptionRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.createSubscription(auth.getName(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionRequest request,
            Authentication auth) {
        return ResponseEntity.ok(subscriptionService.updateSubscription(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable UUID id, Authentication auth) {
        subscriptionService.deleteSubscription(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
