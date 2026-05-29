package com.iponchallenge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "school_name")
    private String schoolName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "monthly_allowance", precision = 12, scale = 2)
    private BigDecimal monthlyAllowance;

    @Enumerated(EnumType.STRING)
    @Column(name = "allowance_schedule")
    private AllowanceSchedule allowanceSchedule;

    // columnDefinition supplies a DB-level default so Hibernate auto-update can add these
    // NOT NULL columns to a users table that already has rows (Postgres-safe migration).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(20) default 'STUDENT'")
    @Builder.Default
    private Role role = Role.STUDENT;

    /**
     * Bumped to invalidate all previously issued JWTs for this user
     * (used by logout-all and password change). Tokens carry the version
     * they were minted with; a mismatch is rejected.
     */
    @Column(name = "token_version", nullable = false, columnDefinition = "integer default 0")
    @Builder.Default
    private int tokenVersion = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
