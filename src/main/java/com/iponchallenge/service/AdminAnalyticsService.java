package com.iponchallenge.service;

import com.iponchallenge.dto.AdminAnalyticsResponse;
import com.iponchallenge.dto.AdminAnalyticsResponse.GrowthPoint;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the aggregated, admin-only "App Growth" analytics.
 *
 * Returns only counts and derived metrics — never per-user data — so the result
 * is safe to hand to any authenticated ADMIN. Access control itself is enforced
 * upstream by SecurityConfig (/api/admin/** -> hasRole("ADMIN")).
 */
@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    /** Number of trailing days included in the growth-over-time chart. */
    private static final int GROWTH_WINDOW_DAYS = 30;

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public AdminAnalyticsResponse getAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = LocalDate.now();

        long totalUsers = userRepository.count();
        long activatedUsers = expenseRepository.countDistinctUsers();

        double avgTransactions = totalUsers == 0
                ? 0.0
                : round1((double) expenseRepository.count() / totalUsers);
        double activationRate = totalUsers == 0
                ? 0.0
                : round2((double) activatedUsers / totalUsers);

        return AdminAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .newUsersToday(userRepository.countByCreatedAtAfter(today.atStartOfDay()))
                .newUsersThisWeek(userRepository.countByCreatedAtAfter(now.minusDays(7)))
                .newUsersThisMonth(userRepository.countByCreatedAtAfter(now.minusDays(30)))
                .activeUsers7Days(userRepository.countByLastLoginAtAfter(now.minusDays(7)))
                .activeUsers30Days(userRepository.countByLastLoginAtAfter(now.minusDays(30)))
                .totalAppUsage(userRepository.sumLoginCount())
                .totalTransactions(expenseRepository.count())
                .activatedUsers(activatedUsers)
                .avgTransactionsPerUser(avgTransactions)
                .activationRate(activationRate)
                .growth(buildGrowthSeries(today))
                .asOf(now.toString())
                .build();
    }

    /**
     * Buckets every signup timestamp into a per-day count for the trailing window,
     * emitting a zero-filled, continuous series (so the chart has no gaps).
     */
    private List<GrowthPoint> buildGrowthSeries(LocalDate today) {
        LocalDate start = today.minusDays(GROWTH_WINDOW_DAYS - 1L);

        // Seed every day in the window with 0 so missing days still render.
        Map<LocalDate, Long> byDay = new LinkedHashMap<>();
        for (LocalDate d = start; !d.isAfter(today); d = d.plusDays(1)) {
            byDay.put(d, 0L);
        }

        for (LocalDateTime created : userRepository.findAllCreatedAt()) {
            LocalDate day = created.toLocalDate();
            if (!day.isBefore(start) && !day.isAfter(today)) {
                byDay.merge(day, 1L, (a, b) -> a + b);
            }
        }

        List<GrowthPoint> series = new ArrayList<>(byDay.size());
        byDay.forEach((day, count) -> series.add(new GrowthPoint(day.toString(), count)));
        return series;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
