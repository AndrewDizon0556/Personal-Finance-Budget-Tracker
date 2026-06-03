package com.iponchallenge.controller;

import com.iponchallenge.dto.AllowancePredictionResponse;
import com.iponchallenge.service.AllowancePredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/allowance/prediction")
@RequiredArgsConstructor
public class AllowancePredictionController {

    private final AllowancePredictionService predictionService;

    @GetMapping
    public ResponseEntity<AllowancePredictionResponse> getPrediction(Authentication auth) {
        return ResponseEntity.ok(predictionService.getPrediction(auth.getName()));
    }
}
