package com.iponchallenge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SyncItemDto {

    @NotBlank(message = "queueId is required")
    private String queueId;

    @NotBlank(message = "offlineId is required")
    private String offlineId;

    @NotBlank(message = "entity is required")
    private String entity; // expense | budget | goal

    @NotBlank(message = "operation is required")
    private String operation; // CREATE | UPDATE | DELETE

    @NotNull(message = "payload is required")
    private Map<String, Object> payload;
}
