package com.iponchallenge.mapper;

import com.iponchallenge.dto.LessonResponse;
import com.iponchallenge.entity.FinancialLesson;
import com.iponchallenge.entity.UserLessonProgress;
import org.springframework.stereotype.Component;

@Component
public class LessonMapper {

    public LessonResponse toResponse(FinancialLesson lesson, UserLessonProgress progress) {
        boolean completed = progress != null && progress.isCompleted();
        Integer score = progress != null ? progress.getScore() : null;
        String completedAt = (progress != null && progress.getCompletedAt() != null)
                ? progress.getCompletedAt().toString()
                : null;

        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .content(lesson.getContent())
                .category(lesson.getCategory())
                .difficulty(lesson.getDifficulty())
                .orderIndex(lesson.getOrderIndex())
                .icon(lesson.getIcon())
                .estimatedMinutes(lesson.getEstimatedMinutes())
                .hasCalculator(lesson.isHasCalculator())
                .completed(completed)
                .score(score)
                .completedAt(completedAt)
                .build();
    }
}
