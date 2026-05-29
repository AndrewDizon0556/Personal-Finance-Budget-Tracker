package com.iponchallenge.controller;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.service.RunwayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/runway")
@RequiredArgsConstructor
public class RunwayController {

    private final RunwayService runwayService;

    @GetMapping
    public ResponseEntity<RunwayResponse> getRunway(Authentication auth) {
        return ResponseEntity.ok(runwayService.getRunway(auth.getName()));
    }
}
