package com.iponchallenge.service;

import com.iponchallenge.entity.AllowanceSchedule;
import com.iponchallenge.entity.CategoryType;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.repository.ExpenseCategoryRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs daily at midnight UTC (8 AM PHT) and automatically injects an INCOME
 * transaction for every user whose allowance is due according to their schedule.
 *
 * Logic: if today >= lastAllowancePaidAt + period (or never paid before), inject.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AllowanceSchedulerService {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;

    @Scheduled(cron = "0 0 0 * * *") // midnight UTC = 8 AM PHT
    @Transactional
    public void processScheduledAllowances() {
        List<User> candidates = userRepository.findByAllowanceScheduleNotNullAndMonthlyAllowanceNotNull();
        LocalDate today = LocalDate.now();
        int processed = 0;

        for (User user : candidates) {
            try {
                if (isDue(user, today)) {
                    injectAllowance(user, today);
                    user.setLastAllowancePaidAt(today);
                    userRepository.save(user);
                    processed++;
                }
            } catch (Exception e) {
                log.error("Failed to inject allowance for user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        if (processed > 0) {
            log.info("Auto-allowance: injected income for {} user(s) on {}", processed, today);
        }
    }

    /** Returns true when today is on or past the next expected payout date. */
    private boolean isDue(User user, LocalDate today) {
        LocalDate last = user.getLastAllowancePaidAt();
        if (last == null) return true; // first run — always inject

        LocalDate nextDue = computeNextDue(user.getAllowanceSchedule(), last);
        return !today.isBefore(nextDue);
    }

    private LocalDate computeNextDue(AllowanceSchedule schedule, LocalDate last) {
        return switch (schedule) {
            case DAILY    -> last.plusDays(1);
            case WEEKLY   -> last.plusWeeks(1);
            case BIWEEKLY -> last.plusWeeks(2);
            case MONTHLY  -> last.plusMonths(1);
        };
    }

    private void injectAllowance(User user, LocalDate date) {
        ExpenseCategory category = resolveAllowanceCategory(user);

        Expense income = Expense.builder()
                .user(user)
                .category(category)
                .amount(user.getMonthlyAllowance())
                .notes("Auto-allowance (" + user.getAllowanceSchedule().name().toLowerCase() + ")")
                .expenseDate(date)
                .transactionType(TransactionType.INCOME)
                .build();

        expenseRepository.save(income);
    }

    /** Finds the user's "Allowance" income category; falls back to any income category; null if none. */
    private ExpenseCategory resolveAllowanceCategory(User user) {
        List<ExpenseCategory> income = categoryRepository.findByUserOrderByNameAsc(user)
                .stream()
                .filter(c -> c.getType() == CategoryType.INCOME)
                .toList();
        return income.stream()
                .filter(c -> "Allowance".equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElse(income.isEmpty() ? null : income.get(0));
    }

    /** Public helper used by AllowanceScheduleController to compute next payout date. */
    public LocalDate getNextPayoutDate(User user) {
        LocalDate last = user.getLastAllowancePaidAt();
        if (last == null || user.getAllowanceSchedule() == null) return LocalDate.now();
        return computeNextDue(user.getAllowanceSchedule(), last);
    }
}
