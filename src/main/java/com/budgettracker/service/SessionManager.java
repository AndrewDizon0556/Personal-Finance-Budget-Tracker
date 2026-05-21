package com.budgettracker.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionManager {
    private final Map<UUID, String> sessions = new ConcurrentHashMap<>();

    public void registerSession(UUID userId, String token) {
        sessions.put(userId, token);
    }

    public String getToken(UUID userId) {
        return sessions.get(userId);
    }

    public void removeSession(UUID userId) {
        sessions.remove(userId);
    }
}
