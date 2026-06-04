package com.iponchallenge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HelpPreferenceRequest {

    @NotBlank
    @Size(max = 120)
    private String guideName;

    private boolean completed;
}
