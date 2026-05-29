package com.iponchallenge.repository;

import com.iponchallenge.entity.Budget;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findByUserAndMonthAndYear(User user, int month, int year);

    Optional<Budget> findByUserAndCategoryAndMonthAndYear(
            User user, ExpenseCategory category, int month, int year
    );

    Optional<Budget> findByIdAndUser(UUID id, User user);

    boolean existsByUserAndCategoryAndMonthAndYear(
            User user, ExpenseCategory category, int month, int year
    );

    void deleteByCategory(ExpenseCategory category);
}
