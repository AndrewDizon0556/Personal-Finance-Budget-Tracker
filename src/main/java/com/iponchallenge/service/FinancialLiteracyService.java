package com.iponchallenge.service;

import com.iponchallenge.dto.LessonResponse;
import com.iponchallenge.dto.UserProgressResponse;
import com.iponchallenge.entity.FinancialLesson;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserLessonProgress;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.LessonMapper;
import com.iponchallenge.repository.FinancialLessonRepository;
import com.iponchallenge.repository.UserLessonProgressRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialLiteracyService {

    private final FinancialLessonRepository lessonRepository;
    private final UserLessonProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final LessonMapper lessonMapper;

    public List<LessonResponse> getLessons(String email) {
        User user = getUser(email);
        List<FinancialLesson> lessons = lessonRepository.findAllByOrderByOrderIndexAsc();

        Map<UUID, UserLessonProgress> progressMap = progressRepository.findByUser(user)
                .stream()
                .collect(Collectors.toMap(p -> p.getLesson().getId(), p -> p));

        return lessons.stream()
                .map(l -> lessonMapper.toResponse(l, progressMap.get(l.getId())))
                .collect(Collectors.toList());
    }

    public LessonResponse getLesson(String email, UUID lessonId) {
        User user = getUser(email);
        FinancialLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        UserLessonProgress progress = progressRepository.findByUserAndLesson(user, lesson).orElse(null);
        return lessonMapper.toResponse(lesson, progress);
    }

    @Transactional
    public LessonResponse completeLesson(String email, UUID lessonId, Integer score) {
        User user = getUser(email);
        FinancialLesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        UserLessonProgress progress = progressRepository.findByUserAndLesson(user, lesson)
                .orElse(UserLessonProgress.builder().user(user).lesson(lesson).build());

        progress.setCompleted(true);
        progress.setScore(score);
        progress.setCompletedAt(LocalDateTime.now());

        progressRepository.save(progress);
        return lessonMapper.toResponse(lesson, progress);
    }

    public UserProgressResponse getUserProgress(String email) {
        User user = getUser(email);
        List<FinancialLesson> allLessons = lessonRepository.findAllByOrderByOrderIndexAsc();
        List<UserLessonProgress> progresses = progressRepository.findByUser(user);

        int total = allLessons.size();
        long completed = progresses.stream().filter(UserLessonProgress::isCompleted).count();
        double pct = total > 0 ? (completed * 100.0 / total) : 0.0;

        int avgScore = progresses.stream()
                .filter(p -> p.isCompleted() && p.getScore() != null)
                .mapToInt(UserLessonProgress::getScore)
                .average()
                .stream().mapToInt(d -> (int) Math.round(d))
                .findFirst()
                .orElse(0);

        int streak = computeStreak(progresses);

        String level;
        String levelMessage;
        if (completed == 0) {
            level = "BEGINNER";
            levelMessage = "Start your first lesson to begin your financial journey!";
        } else if (pct < 50) {
            level = "BEGINNER";
            levelMessage = "Good start! Keep learning to unlock more money wisdom.";
        } else if (pct < 80) {
            level = "INTERMEDIATE";
            levelMessage = "You're building solid money habits. Keep going!";
        } else {
            level = "ADVANCED";
            levelMessage = "Impressive! You're well on your way to financial mastery.";
        }

        return UserProgressResponse.builder()
                .totalLessons(total)
                .completedLessons((int) completed)
                .completionPercentage(Math.min(pct, 100.0))
                .currentStreak(streak)
                .averageScore(avgScore)
                .level(level)
                .levelMessage(levelMessage)
                .build();
    }

    /** Counts consecutive days (ending today) on which at least one lesson was completed. */
    private int computeStreak(List<UserLessonProgress> progresses) {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.Set<java.time.LocalDate> activeDays = progresses.stream()
                .filter(p -> p.isCompleted() && p.getCompletedAt() != null)
                .map(p -> p.getCompletedAt().toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        java.time.LocalDate cursor = today;
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
