package com.iponchallenge.service;

import com.iponchallenge.dto.AnalyticsResponse;
import com.iponchallenge.dto.CategoryTotalDto;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public AnalyticsResponse getAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        List<Expense> expenses = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, startOfMonth, endOfMonth)
                .stream()
                .filter(e -> e.getTransactionType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());

        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategoryTotalDto> categoryTotals = buildCategoryTotals(expenses, total);
        String highest = categoryTotals.isEmpty() ? null : categoryTotals.get(0).getCategoryName();
        List<BigDecimal> weeklyTotals = buildWeeklyTotals(expenses);

        return AnalyticsResponse.builder()
                .totalSpentThisMonth(total)
                .highestSpendingCategory(highest)
                .categoryTotals(categoryTotals)
                .weeklyTotals(weeklyTotals)
                .build();
    }

    private List<CategoryTotalDto> buildCategoryTotals(List<Expense> expenses, BigDecimal total) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Expense e : expenses) {
            String cat = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
            map.merge(cat, e.getAmount(), BigDecimal::add);
        }

        return map.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue(Comparator.reverseOrder()))
                .map(entry -> {
                    double pct = total.compareTo(BigDecimal.ZERO) > 0
                            ? entry.getValue()
                                    .divide(total, 4, RoundingMode.HALF_UP)
                                    .doubleValue() * 100
                            : 0.0;
                    return new CategoryTotalDto(entry.getKey(), entry.getValue(), pct);
                })
                .collect(Collectors.toList());
    }

    private List<BigDecimal> buildWeeklyTotals(List<Expense> expenses) {
        List<BigDecimal> weeks = new ArrayList<>(
                List.of(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)
        );
        for (Expense e : expenses) {
            int weekIndex = Math.min((e.getExpenseDate().getDayOfMonth() - 1) / 7, 4);
            weeks.set(weekIndex, weeks.get(weekIndex).add(e.getAmount()));
        }
        return weeks;
    }
}
