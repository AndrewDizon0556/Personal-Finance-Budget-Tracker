package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonResponse {

    private UUID id;
    private String title;
    private String description;
    private String content; // raw JSON — frontend parses and renders
    private String category;
    private String difficulty;
    private int orderIndex;
    private String icon;
    private int estimatedMinutes;
    private boolean hasCalculator;

    // Populated from UserLessonProgress for the requesting user
    private boolean completed;
    private Integer score;
    private String completedAt;
}
