package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Aggregated, admin-only application analytics. Contains NO personally
 * identifiable information — only counts and derived metrics — so it is safe
 * to expose to an authenticated ADMIN without leaking user data.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsResponse {

    // Registered users
    private long totalUsers;
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUsersThisMonth;

    // Active users (based on last login)
    private long activeUsers7Days;
    private long activeUsers30Days;

    // Total app usage (sum of all successful logins)
    private long totalAppUsage;

    // Engagement summary
    private long totalTransactions;
    private long activatedUsers;          // users with >= 1 transaction
    private double avgTransactionsPerUser;
    private double activationRate;         // activatedUsers / totalUsers (0..1)

    // Growth over time — one point per day for the trailing window
    private List<GrowthPoint> growth;

    private String asOf;

    /** A single day in the growth series. */
    @Getter
    @AllArgsConstructor
    public static class GrowthPoint {
        private final String date;   // ISO yyyy-MM-dd
        private final long count;    // signups that day
    }
}
