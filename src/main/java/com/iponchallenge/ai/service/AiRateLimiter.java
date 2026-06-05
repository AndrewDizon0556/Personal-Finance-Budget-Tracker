package com.iponchallenge.ai.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory, per-user daily cap on AI requests.
 *
 * Keeps free-tier usage within quota and stops any single user from running up
 * cost/quota. Resets each calendar day. (In-memory is per-instance — fine for a
 * single backend; for multi-instance, back this with the database or Redis.)
 */
@Component
public class AiRateLimiter {

    private static final int DAILY_LIMIT = 15;

    private record Usage(LocalDate date, int count) {}

    private final Map<String, Usage> usage = new ConcurrentHashMap<>();

    /** Records and allows the request, or returns false if today's cap is reached. */
    public synchronized boolean tryAcquire(String email) {
        LocalDate today = LocalDate.now();
        Usage current = usage.get(email);
        if (current == null || !current.date().equals(today)) {
            usage.put(email, new Usage(today, 1));
            return true;
        }
        if (current.count() >= DAILY_LIMIT) {
            return false;
        }
        usage.put(email, new Usage(today, current.count() + 1));
        return true;
    }

    public int dailyLimit() {
        return DAILY_LIMIT;
    }
}
