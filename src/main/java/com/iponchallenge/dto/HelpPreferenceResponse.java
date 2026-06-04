package com.iponchallenge.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class HelpPreferenceResponse {
    private UUID id;
    private String guideName;
    private boolean completed;
    private Instant lastShown;
    private Instant updatedAt;
}
