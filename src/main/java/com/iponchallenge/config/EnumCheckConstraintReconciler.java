package com.iponchallenge.config;

import com.iponchallenge.entity.TransactionType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Keeps the {@code expenses.transaction_type} CHECK constraint in sync with the
 * {@link TransactionType} enum.
 *
 * <p>Hibernate 6 (Spring Boot 3.2) auto-generates a CHECK constraint for
 * {@code @Enumerated(STRING)} columns, but {@code ddl-auto=update} never rewrites
 * an existing one. So when a new enum value is added (e.g. {@code GOAL_CONTRIBUTION}),
 * inserts of that value are rejected by the stale constraint on databases created
 * earlier — surfacing as a generic 500 on "Add Money". This runner drops and
 * recreates the constraint from the current enum on every boot, so any environment
 * self-heals and future enum additions never hit the same wall.
 *
 * <p>Idempotent and PostgreSQL-only; any failure is logged, never fatal.
 */
@Component
@RequiredArgsConstructor
public class EnumCheckConstraintReconciler implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EnumCheckConstraintReconciler.class);

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) {
        try {
            String product = jdbc.execute(
                    (ConnectionCallback<String>) c -> c.getMetaData().getDatabaseProductName());
            if (product == null || !product.toLowerCase().contains("postgresql")) {
                return; // Skip non-Postgres datasources (e.g. H2 in tests).
            }

            // Enum names are compile-time constants — safe to inline (no injection risk).
            String values = Arrays.stream(TransactionType.values())
                    .map(t -> "'" + t.name() + "'")
                    .collect(Collectors.joining(", "));

            jdbc.execute("ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_transaction_type_check");
            jdbc.execute("ALTER TABLE expenses ADD CONSTRAINT expenses_transaction_type_check "
                    + "CHECK (transaction_type IN (" + values + "))");
            log.info("Reconciled expenses.transaction_type check constraint with [{}]", values);
        } catch (Exception ex) {
            // Hardening step only — never block application startup over it.
            log.warn("Could not reconcile transaction_type check constraint: {}", ex.getMessage());
        }
    }
}
