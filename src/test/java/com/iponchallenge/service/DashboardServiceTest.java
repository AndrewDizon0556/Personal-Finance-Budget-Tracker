package com.iponchallenge.service;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.RunwayStatus;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.mapper.BudgetMapper;
import com.iponchallenge.mapper.ExpenseMapper;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.ExpenseRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Verifies the wallet/remaining-balance formula: allowance + income − expenses.
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private UserRepository userRepository;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private BudgetRepository budgetRepository;
    @Mock private ExpenseMapper expenseMapper;
    @Mock private BudgetMapper budgetMapper;
    @Mock private RunwayService runwayService;

    @InjectMocks private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        User user = User.builder().email(EMAIL).monthlyAllowance(new BigDecimal("5000")).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(budgetRepository.findByUserAndMonthAndYear(any(), anyInt(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(expenseRepository.findTop5ByUserOrderByExpenseDateDescCreatedAtDesc(any()))
                .thenReturn(Collections.emptyList());
        when(runwayService.getRunway(EMAIL)).thenReturn(RunwayResponse.builder()
                .remainingBalance(BigDecimal.ZERO)
                .avgDailySpending(BigDecimal.ZERO)
                .estimatedDaysRemaining(100)
                .daysUntilNextAllowance(10)
                .runwayStatus(RunwayStatus.SAFE)
                .message("ok")
                .build());
    }

    private void stubTotals(String income, String expense) {
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.INCOME)))
                .thenReturn(new BigDecimal(income));
        when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal(expense));
    }

    @Test
    void income_increasesRemainingBalance() {
        stubTotals("1000", "0"); // allowance 5000 + income 1000
        assertThat(dashboardService.getDashboard(EMAIL).getRemainingBalance())
                .isEqualByComparingTo("6000");
    }

    @Test
    void expense_decreasesRemainingBalance() {
        stubTotals("0", "1000"); // allowance 5000 − expense 1000
        assertThat(dashboardService.getDashboard(EMAIL).getRemainingBalance())
                .isEqualByComparingTo("4000");
    }

    @Test
    void incomeAndExpense_netCorrectly() {
        stubTotals("2000", "1500"); // 5000 + 2000 − 1500
        assertThat(dashboardService.getDashboard(EMAIL).getRemainingBalance())
                .isEqualByComparingTo("5500");
    }

    @Test
    void spentFieldReflectsExpensesOnly() {
        stubTotals("2000", "1500");
        assertThat(dashboardService.getDashboard(EMAIL).getTotalSpentThisMonth())
                .isEqualByComparingTo("1500");
    }
}
