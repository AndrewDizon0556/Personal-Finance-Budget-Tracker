package com.iponchallenge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "financial_lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialLesson {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    // JSON-encoded array of content blocks rendered by the frontend
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String category; // ALLOWANCE, SAVINGS, PLANNING, CREDIT, BUDGETING, DEBT

    @Column(nullable = false)
    private String difficulty; // BEGINNER, INTERMEDIATE

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(nullable = false)
    private String icon; // emoji

    @Column(name = "estimated_minutes", nullable = false)
    private int estimatedMinutes;

    // Whether this lesson includes an interactive compound calculator
    @Column(name = "has_calculator", nullable = false)
    private boolean hasCalculator;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
