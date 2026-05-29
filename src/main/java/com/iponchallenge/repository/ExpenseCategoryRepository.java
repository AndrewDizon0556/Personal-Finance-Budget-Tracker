package com.iponchallenge.repository;

import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, UUID> {

    List<ExpenseCategory> findByUserOrderByNameAsc(User user);

    Optional<ExpenseCategory> findByIdAndUser(UUID id, User user);

    boolean existsByIdAndUser(UUID id, User user);
}
