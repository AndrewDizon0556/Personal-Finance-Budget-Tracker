package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressResponse {

    private int totalLessons;
    private int completedLessons;
    private double completionPercentage;
    private int currentStreak;   // consecutive days with a lesson completed
    private int averageScore;    // average quiz score across completed quizzes
    private String level;        // BEGINNER, INTERMEDIATE, ADVANCED
    private String levelMessage;
}
