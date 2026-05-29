package com.iponchallenge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lightweight per-IP fixed-window rate limiter for the auth endpoints,
 * protecting login/registration from automated abuse.
 */
@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 20;       // per window
    private static final long WINDOW_SECONDS = 60;

    private record Window(int count, Instant resetAt) {}

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain chain
    ) throws ServletException, IOException {

        String ip = clientIp(request);
        Instant now = Instant.now();

        Window w = windows.compute(ip, (k, prev) -> {
            if (prev == null || now.isAfter(prev.resetAt())) {
                return new Window(1, now.plusSeconds(WINDOW_SECONDS));
            }
            return new Window(prev.count() + 1, prev.resetAt());
        });

        if (w.count() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many attempts. Please slow down and try again shortly.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
