package com.iponchallenge.repository;

import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByUserOrderByExpenseDateDescCreatedAtDesc(User user);

    List<Expense> findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(
            User user, LocalDate start, LocalDate end
    );

    List<Expense> findTop5ByUserOrderByExpenseDateDescCreatedAtDesc(User user);

    Optional<Expense> findByIdAndUser(UUID id, User user);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.user = :user " +
           "AND e.expenseDate BETWEEN :start AND :end " +
           "AND e.transactionType = :type")
    BigDecimal sumByUserAndDateBetweenAndType(
            @Param("user") User user,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("type") TransactionType type
    );
}
