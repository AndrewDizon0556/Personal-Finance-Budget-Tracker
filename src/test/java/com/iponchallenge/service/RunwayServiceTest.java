package com.iponchallenge.service;

import com.iponchallenge.dto.RunwayResponse;
import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.Expense;
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
import java.util.List;
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
        // Default: no money moved into savings goals. Individual tests can override.
        lenient().when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.GOAL_CONTRIBUTION)))
                .thenReturn(BigDecimal.ZERO);
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
    void goalContributions_reduceRemainingBalance() {
        stubUser(new BigDecimal("5000"), AllowanceSchedule.MONTHLY);
        stubSums("0", "0"); // no spending, no income
        // ₱1,200 moved into savings goals this month.
        lenient().when(expenseRepository.sumByUserAndDateBetweenAndType(
                any(), any(LocalDate.class), any(LocalDate.class), eq(TransactionType.GOAL_CONTRIBUTION)))
                .thenReturn(new BigDecimal("1200"));

        RunwayResponse r = runwayService.getRunway(EMAIL);

        // 5000 allowance − 1200 saved into goals = 3800 still spendable.
        assertThat(r.getRemainingBalance()).isEqualByComparingTo("3800");
    }

    @Test
    void dailySchedule_alwaysOneDayUntilNextAllowance() {
        stubUser(new BigDecimal("500"), AllowanceSchedule.DAILY);
        stubSums("100", "0");

        assertThat(runwayService.getRunway(EMAIL).getDaysUntilNextAllowance()).isEqualTo(1);
    }

    /**
     * Regression: a single one-off purchase (e.g. ₱15,000 tuition/transport) must NOT
     * be treated as daily spending. With ₱14,900 still in the wallet the runway should
     * stay healthy, not crash to a few days and flag CRITICAL.
     */
    @Test
    void oneOffLargeExpense_isExcludedFromDailyPace() {
        stubUser(new BigDecimal("15000"), AllowanceSchedule.MONTHLY);
        stubSums("100", "0"); // this month: only ₱100 spent → remaining ₱14,900

        when(expenseRepository.findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(
                any(), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(
                        expense("15000", LocalDate.now().minusDays(4)), // one-off, must be excluded
                        expense("100", LocalDate.now())                  // everyday spending
                ));

        RunwayResponse r = runwayService.getRunway(EMAIL);

        assertThat(r.getRemainingBalance()).isEqualByComparingTo("14900");
        assertThat(r.getEstimatedDaysRemaining()).isGreaterThan(30);
        assertThat(r.getRunwayStatus()).isEqualTo(RunwayStatus.SAFE);
    }

    private Expense expense(String amount, LocalDate date) {
        return Expense.builder()
                .amount(new BigDecimal(amount))
                .transactionType(TransactionType.EXPENSE)
                .expenseDate(date)
                .build();
    }
}
