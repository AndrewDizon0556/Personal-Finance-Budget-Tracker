package com.iponchallenge.service;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.RunwayStatus;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Verifies the Allowance Runway. The key regression guarded here: income must be
 * included in the remaining balance, otherwise a large income leaves the runway
 * dividing an allowance-only balance and the estimate floors to 0 days.
 */
@ExtendWith(MockitoExtension.class)
class RunwayServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private UserRepository userRepository;
    @Mock private ExpenseRepository expenseRepository;

    @InjectMocks private RunwayService runwayService;

    private void stubUser(BigDecimal allowance, AllowanceSchedule schedule) {
        User user = User.builder()
                .email(EMAIL)
                .monthlyAllowance(allowance)
                .allowanceSchedule(schedule)
                .createdAt(LocalDateTime.now())
                .build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    /** Stub EXPENSE/INCOME sums (same value across date ranges is fine for these cases). */
    private void stubSums(String expense, String income) {
        lenient().when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.EXPENSE)))
                .thenReturn(new BigDecimal(expense));
        lenient().when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.INCOME)))
                .thenReturn(new BigDecimal(income));
    }

    @Test
    void largeIncome_isIncludedInRemainingBalance() {
        stubUser(new BigDecimal("15000"), AllowanceSchedule.MONTHLY);
        stubSums("14100", "1010000"); // big freelance/allowance income this month

        RunwayResponse r = runwayService.getRunway(EMAIL);

        // 15000 + 1,010,000 − 14,100
        assertThat(r.getRemainingBalance()).isEqualByComparingTo("1010900");
    }

    @Test
    void healthyBalance_doesNotFloorRunwayToZero() {
        stubUser(new BigDecimal("15000"), AllowanceSchedule.MONTHLY);
        stubSums("14100", "1010000");

        RunwayResponse r = runwayService.getRunway(EMAIL);

        // Was 0 before the fix (allowance-only balance ÷ daily spend floored to 0).
        assertThat(r.getEstimatedDaysRemaining()).isGreaterThan(0);
        assertThat(r.getRunwayStatus()).isEqualTo(RunwayStatus.SAFE);
    }

    @Test
    void noSpending_yieldsEffectivelyInfiniteRunway() {
        stubUser(new BigDecimal("5000"), AllowanceSchedule.MONTHLY);
        stubSums("0", "0");

        RunwayResponse r = runwayService.getRunway(EMAIL);

        assertThat(r.getEstimatedDaysRemaining()).isEqualTo(999); // rendered as ∞
    }

    @Test
    void overspent_yieldsZeroRunwayLegitimately() {
        stubUser(new BigDecimal("1000"), AllowanceSchedule.MONTHLY);
        stubSums("5000", "0"); // spent more than allowance, no income

        RunwayResponse r = runwayService.getRunway(EMAIL);

        assertThat(r.getRemainingBalance()).isLessThanOrEqualTo(BigDecimal.ZERO);
        assertThat(r.getEstimatedDaysRemaining()).isZero();
        assertThat(r.getRunwayStatus()).isEqualTo(RunwayStatus.CRITICAL);
    }

    @Test
    void dailySchedule_alwaysOneDayUntilNextAllowance() {
        stubUser(new BigDecimal("500"), AllowanceSchedule.DAILY);
        stubSums("100", "0");

        assertThat(runwayService.getRunway(EMAIL).getDaysUntilNextAllowance()).isEqualTo(1);
    }
}
