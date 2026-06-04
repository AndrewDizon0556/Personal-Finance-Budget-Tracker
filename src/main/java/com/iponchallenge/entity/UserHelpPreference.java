package com.iponchallenge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Tracks which guidance moments (tour, feature guides, dismissed tips) a student
 * has already seen, so the app never nags with the same coach-mark twice.
 * One row per (user, guideName). Drives the "smart help" logic on the client.
 */
@Entity
@Table(
        name = "user_help_preferences",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "guide_name"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHelpPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "guide_name", nullable = false)
    private String guideName;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "last_shown")
    private Instant lastShown;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
