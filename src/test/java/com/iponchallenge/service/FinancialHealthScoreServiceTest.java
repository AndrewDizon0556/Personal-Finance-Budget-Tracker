package com.iponchallenge.service;

import com.iponchallenge.dto.FinancialHealthScoreResponse;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.User;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.EmergencyFundRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserChallengeProgressRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinancialHealthScoreServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private UserRepository userRepository;
    @Mock private SavingsGoalRepository goalRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private EmergencyFundRepository emergencyFundRepository;
    @Mock private UserChallengeProgressRepository challengeProgressRepository;
    @Mock private RunwayService runwayService;

    @InjectMocks private FinancialHealthScoreService healthScoreService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().email(EMAIL).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    @Test
    void score_isPoor_whenNoDataAtAll() {
        when(goalRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(budgetRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt())).thenReturn(Collections.emptyList());
        when(emergencyFundRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(challengeProgressRepository.countByUserAndCompleted(user, true)).thenReturn(0L);
        when(challengeProgressRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(runwayService.getRunway(EMAIL)).thenThrow(new RuntimeException("no data"));

        FinancialHealthScoreResponse response = healthScoreService.getScore(EMAIL);

        // Spending Rate gives the benefit of the doubt (full 20 pts) when there is no
        // allowance data yet, so a brand-new user scores 20 — still POOR overall.
        assertThat(response.getScore()).isEqualTo(20);
        assertThat(response.getLevel()).isEqualTo("POOR");
    }

    @Test
    void score_isExcellent_whenAllFactorsMaxed() {
        SavingsGoal completedGoal = SavingsGoal.builder()
                .targetAmount(new BigDecimal("5000"))
                .currentAmount(new BigDecimal("5000"))
                .build();

        com.iponchallenge.entity.Budget budget = com.iponchallenge.entity.Budget.builder()
                .budgetAmount(new BigDecimal("2000"))
                .remainingBudget(new BigDecimal("1800"))
                .month(LocalDate.now().getMonthValue())
                .year(LocalDate.now().getYear())
                .build();

        com.iponchallenge.entity.EmergencyFund fund = com.iponchallenge.entity.EmergencyFund.builder()
                .targetAmount(new BigDecimal("3000"))
                .currentAmount(new BigDecimal("3000"))
                .build();

        com.iponchallenge.dto.RunwayResponse runway = com.iponchallenge.dto.RunwayResponse.builder()
                .remainingBalance(new BigDecimal("2000"))
                .avgDailySpending(new BigDecimal("50"))
                .estimatedDaysRemaining(40)
                .daysUntilNextAllowance(7)
                .runwayStatus(com.iponchallenge.entity.RunwayStatus.SAFE)
                .message("On track")
                .build();

        when(goalRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(completedGoal));
        when(budgetRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt())).thenReturn(List.of(budget));
        when(emergencyFundRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(List.of(fund));
        when(challengeProgressRepository.countByUserAndCompleted(user, true)).thenReturn(3L);
        when(challengeProgressRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(Collections.emptyList());
        when(runwayService.getRunway(EMAIL)).thenReturn(runway);

        FinancialHealthScoreResponse response = healthScoreService.getScore(EMAIL);

        assertThat(response.getScore()).isGreaterThanOrEqualTo(85);
        assertThat(response.getLevel()).isEqualTo("EXCELLENT");
        assertThat(response.getFactors()).hasSize(5);
    }

    @Test
    void factorNames_areCorrect() {
        when(goalRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(budgetRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt())).thenReturn(Collections.emptyList());
        when(emergencyFundRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(challengeProgressRepository.countByUserAndCompleted(user, true)).thenReturn(0L);
        when(challengeProgressRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(runwayService.getRunway(EMAIL)).thenThrow(new RuntimeException());

        FinancialHealthScoreResponse response = healthScoreService.getScore(EMAIL);

        List<String> names = response.getFactors().stream()
                .map(FinancialHealthScoreResponse.HealthFactor::getName)
                .toList();
        assertThat(names).containsExactly(
                "Savings Habit", "Budget Control", "Spending Rate", "Challenges", "Emergency Fund");
    }
}
