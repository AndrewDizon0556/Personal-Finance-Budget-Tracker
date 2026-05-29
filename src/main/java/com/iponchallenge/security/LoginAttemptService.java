package com.iponchallenge.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory brute-force protection: locks an account after too many failed
 * logins for a cool-down window. Suitable for a single-instance deployment.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_MINUTES = 15;

    private record Attempt(int count, Instant lockedUntil) {}

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    private String key(String email) {
        return email == null ? "" : email.toLowerCase();
    }

    public boolean isLocked(String email) {
        Attempt a = attempts.get(key(email));
        if (a == null || a.lockedUntil() == null) return false;
        if (Instant.now().isBefore(a.lockedUntil())) return true;
        attempts.remove(key(email)); // lock expired
        return false;
    }

    public void recordFailure(String email) {
        attempts.compute(key(email), (k, prev) -> {
            int count = (prev == null ? 0 : prev.count()) + 1;
            Instant lockedUntil = count >= MAX_ATTEMPTS
                    ? Instant.now().plusSeconds(LOCK_MINUTES * 60)
                    : null;
            return new Attempt(count, lockedUntil);
        });
    }

    public void recordSuccess(String email) {
        attempts.remove(key(email));
    }
}
