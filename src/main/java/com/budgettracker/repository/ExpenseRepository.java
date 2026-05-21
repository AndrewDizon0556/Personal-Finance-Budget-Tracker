package com.budgettracker.repository;

import com.budgettracker.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    Page<Expense> findByUserId(UUID userId, Pageable pageable);
    List<Expense> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    List<Expense> findByUserId(UUID userId);
}
