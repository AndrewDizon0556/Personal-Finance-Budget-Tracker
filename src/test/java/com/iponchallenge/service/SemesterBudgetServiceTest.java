package com.iponchallenge.service;

import com.iponchallenge.dto.SemesterBudgetResponse;
import com.iponchallenge.dto.WeeklyBreakdownResponse;
import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.SemesterBudget;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.mapper.SemesterBudgetMapper;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.SemesterBudgetRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SemesterBudgetServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private SemesterBudgetRepository semesterBudgetRepository;
    @Mock private UserRepository userRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Spy  private SemesterBudgetMapper semesterBudgetMapper;

    @InjectMocks private SemesterBudgetService semesterBudgetService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email(EMAIL)
                .monthlyAllowance(new BigDecimal("15000"))
                .allowanceSchedule(AllowanceSchedule.MONTHLY)
                .build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    @Test
    void progressPercentage_reflectsSpentVsTotal() {
        SemesterBudget semester = buildSemester(new BigDecimal("10000"),
                LocalDate.now().minusWeeks(4), LocalDate.now().plusWeeks(10));

        when(semesterBudgetRepository.findByIdAndUser(semester.getId(), user))
                .thenReturn(Optional.of(semester));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("2500"));

        SemesterBudgetResponse response = semesterBudgetService.getSemesterBudget(EMAIL, semester.getId());

        assertThat(response.getProgressPercentage()).isEqualTo(25.0);
        assertThat(response.getRemaining()).isEqualByComparingTo("7500");
    }

    @Test
    void status_isOnTrack_whenSpentLessThan80Percent() {
        SemesterBudget semester = buildSemester(new BigDecimal("10000"),
                LocalDate.now().minusWeeks(2), LocalDate.now().plusWeeks(12));

        when(semesterBudgetRepository.findByIdAndUser(semester.getId(), user))
                .thenReturn(Optional.of(semester));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("5000"));

        SemesterBudgetResponse response = semesterBudgetService.getSemesterBudget(EMAIL, semester.getId());

        assertThat(response.getStatus()).isEqualTo("ON_TRACK");
    }

    @Test
    void status_isWarning_whenSpentOver80Percent() {
        SemesterBudget semester = buildSemester(new BigDecimal("10000"),
                LocalDate.now().minusWeeks(2), LocalDate.now().plusWeeks(12));

        when(semesterBudgetRepository.findByIdAndUser(semester.getId(), user))
                .thenReturn(Optional.of(semester));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal("8500"));

        SemesterBudgetResponse response = semesterBudgetService.getSemesterBudget(EMAIL, semester.getId());

        assertThat(response.getStatus()).isEqualTo("WARNING");
    }

    @Test
    void weeklyBreakdown_currentWeekIsFlagged() {
        LocalDate start = LocalDate.now().minusDays(3); // started 3 days ago
        LocalDate end = start.plusWeeks(16);
        SemesterBudget semester = buildSemester(new BigDecimal("16000"), start, end);

        when(semesterBudgetRepository.findByIdAndUser(semester.getId(), user))
                .thenReturn(Optional.of(semester));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(BigDecimal.ZERO);

        List<WeeklyBreakdownResponse> weeks = semesterBudgetService.getWeeklyBreakdown(EMAIL, semester.getId());

        assertThat(weeks).isNotEmpty();
        long currentCount = weeks.stream().filter(WeeklyBreakdownResponse::isCurrent).count();
        assertThat(currentCount).isEqualTo(1);
    }

    @Test
    void weeklyBreakdown_futureWeeksAreUpcoming() {
        LocalDate start = LocalDate.now().minusDays(3);
        LocalDate end = start.plusWeeks(4);
        SemesterBudget semester = buildSemester(new BigDecimal("4000"), start, end);

        when(semesterBudgetRepository.findByIdAndUser(semester.getId(), user))
                .thenReturn(Optional.of(semester));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(BigDecimal.ZERO);

        List<WeeklyBreakdownResponse> weeks = semesterBudgetService.getWeeklyBreakdown(EMAIL, semester.getId());

        boolean hasUpcoming = weeks.stream().anyMatch(w -> "UPCOMING".equals(w.getStatus()));
        assertThat(hasUpcoming).isTrue();
    }

    private SemesterBudget buildSemester(BigDecimal budget, LocalDate start, LocalDate end) {
        return SemesterBudget.builder()
                .id(UUID.randomUUID())
                .user(user)
                .semesterName("Test Semester")
                .startDate(start)
                .endDate(end)
                .totalBudget(budget)
                .allowanceSchedule(AllowanceSchedule.MONTHLY)
                .build();
    }
}
