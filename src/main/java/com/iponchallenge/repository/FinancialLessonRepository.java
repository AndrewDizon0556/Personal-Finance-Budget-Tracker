package com.iponchallenge.repository;

import com.iponchallenge.entity.FinancialLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FinancialLessonRepository extends JpaRepository<FinancialLesson, UUID> {

    List<FinancialLesson> findAllByOrderByOrderIndexAsc();

    boolean existsByOrderIndex(int orderIndex);
}
