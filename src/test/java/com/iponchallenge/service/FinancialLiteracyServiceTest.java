package com.iponchallenge.service;

import com.iponchallenge.dto.LessonResponse;
import com.iponchallenge.dto.UserProgressResponse;
import com.iponchallenge.entity.FinancialLesson;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserLessonProgress;
import com.iponchallenge.mapper.LessonMapper;
import com.iponchallenge.repository.FinancialLessonRepository;
import com.iponchallenge.repository.UserLessonProgressRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialLiteracyServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private FinancialLessonRepository lessonRepository;
    @Mock private UserLessonProgressRepository progressRepository;
    @Mock private UserRepository userRepository;
    @Spy  private LessonMapper lessonMapper;

    @InjectMocks private FinancialLiteracyService financialLiteracyService;

    private User user;
    private FinancialLesson lesson;

    @BeforeEach
    void setUp() {
        user = User.builder().email(EMAIL).build();
        lesson = FinancialLesson.builder()
                .id(UUID.randomUUID())
                .title("Make Your Baon Last the Week")
                .description("Tips to stretch your allowance.")
                .content("[]")
                .category("ALLOWANCE")
                .difficulty("BEGINNER")
                .orderIndex(1)
                .icon("💰")
                .estimatedMinutes(5)
                .hasCalculator(false)
                .build();

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    @Test
    void getLessons_returnsLessonsWithCompletionStatus() {
        UserLessonProgress progress = UserLessonProgress.builder()
                .user(user)
                .lesson(lesson)
                .completed(true)
                .score(90)
                .completedAt(LocalDateTime.now())
                .build();

        when(lessonRepository.findAllByOrderByOrderIndexAsc()).thenReturn(List.of(lesson));
        when(progressRepository.findByUser(user)).thenReturn(List.of(progress));

        List<LessonResponse> responses = financialLiteracyService.getLessons(EMAIL);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).isCompleted()).isTrue();
        assertThat(responses.get(0).getScore()).isEqualTo(90);
    }

    @Test
    void getLessons_incompleteLessonHasCompletedFalse() {
        when(lessonRepository.findAllByOrderByOrderIndexAsc()).thenReturn(List.of(lesson));
        when(progressRepository.findByUser(user)).thenReturn(List.of());

        List<LessonResponse> responses = financialLiteracyService.getLessons(EMAIL);

        assertThat(responses.get(0).isCompleted()).isFalse();
        assertThat(responses.get(0).getScore()).isNull();
    }

    @Test
    void completeLesson_marksLessonCompleted() {
        when(lessonRepository.findById(lesson.getId())).thenReturn(Optional.of(lesson));
        when(progressRepository.findByUserAndLesson(user, lesson)).thenReturn(Optional.empty());
        when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        LessonResponse response = financialLiteracyService.completeLesson(EMAIL, lesson.getId(), 85);

        assertThat(response.isCompleted()).isTrue();
        assertThat(response.getScore()).isEqualTo(85);
    }

    @Test
    void getUserProgress_levelIsBeginner_whenNothingCompleted() {
        when(lessonRepository.findAllByOrderByOrderIndexAsc()).thenReturn(List.of(lesson));
        when(progressRepository.findByUser(user)).thenReturn(List.of());

        UserProgressResponse progress = financialLiteracyService.getUserProgress(EMAIL);

        assertThat(progress.getCompletedLessons()).isZero();
        assertThat(progress.getLevel()).isEqualTo("BEGINNER");
    }

    @Test
    void getUserProgress_levelIsAdvanced_whenAllCompleted() {
        UserLessonProgress done = UserLessonProgress.builder()
                .user(user).lesson(lesson).completed(true)
                .completedAt(LocalDateTime.now()).score(100).build();

        // Simulate all lessons completed by returning the same lesson 10 times
        List<FinancialLesson> tenLessons = java.util.Collections.nCopies(10, lesson);
        List<UserLessonProgress> tenProgresses = java.util.Collections.nCopies(10, done);

        when(lessonRepository.findAllByOrderByOrderIndexAsc()).thenReturn(tenLessons);
        when(progressRepository.findByUser(user)).thenReturn(tenProgresses);

        UserProgressResponse progress = financialLiteracyService.getUserProgress(EMAIL);

        assertThat(progress.getLevel()).isEqualTo("ADVANCED");
        assertThat(progress.getCompletionPercentage()).isEqualTo(100.0);
    }

    @Test
    void streak_isOne_whenCompletedTodayOnly() {
        UserLessonProgress todayProgress = UserLessonProgress.builder()
                .user(user).lesson(lesson).completed(true)
                .completedAt(LocalDateTime.now()).build();

        when(lessonRepository.findAllByOrderByOrderIndexAsc()).thenReturn(List.of(lesson));
        when(progressRepository.findByUser(user)).thenReturn(List.of(todayProgress));

        UserProgressResponse progress = financialLiteracyService.getUserProgress(EMAIL);

        assertThat(progress.getCurrentStreak()).isEqualTo(1);
    }
}
