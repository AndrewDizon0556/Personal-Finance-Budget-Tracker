package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamificationResponse {
    private int level;
    private int xp;            // alias of totalXp for convenience
    private int xpIntoLevel;
    private int xpForNextLevel;
    private int currentStreak;
    private int longestStreak;
    private int totalXp;
    private List<AchievementDto> achievements;
}
