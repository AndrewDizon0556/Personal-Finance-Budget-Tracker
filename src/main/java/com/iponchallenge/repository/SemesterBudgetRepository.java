package com.iponchallenge.repository;

import com.iponchallenge.entity.SemesterBudget;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SemesterBudgetRepository extends JpaRepository<SemesterBudget, UUID> {

    List<SemesterBudget> findByUserOrderByStartDateDesc(User user);

    Optional<SemesterBudget> findByIdAndUser(UUID id, User user);
}
