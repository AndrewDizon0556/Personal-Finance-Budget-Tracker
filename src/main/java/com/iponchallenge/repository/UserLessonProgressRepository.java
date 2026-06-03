package com.iponchallenge.repository;

import com.iponchallenge.entity.FinancialLesson;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserLessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, UUID> {

    List<UserLessonProgress> findByUser(User user);

    Optional<UserLessonProgress> findByUserAndLesson(User user, FinancialLesson lesson);

    long countByUserAndCompleted(User user, boolean completed);
}
