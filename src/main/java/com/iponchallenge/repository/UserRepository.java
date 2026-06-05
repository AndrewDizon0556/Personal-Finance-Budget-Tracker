package com.iponchallenge.repository;

import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByAllowanceScheduleNotNullAndMonthlyAllowanceNotNull();

    /** Counts users who registered on or after the given timestamp (for signup stats). */
    long countByCreatedAtAfter(LocalDateTime since);

    /** Counts users whose last login is on or after the given timestamp (active users). */
    long countByLastLoginAtAfter(LocalDateTime since);

    /** Sum of all successful logins across users — the app's total usage count. */
    @Query("SELECT COALESCE(SUM(u.loginCount), 0) FROM User u")
    long sumLoginCount();

    /** All registration timestamps, ordered — used to bucket the growth-over-time chart. */
    @Query("SELECT u.createdAt FROM User u WHERE u.createdAt IS NOT NULL ORDER BY u.createdAt ASC")
    List<LocalDateTime> findAllCreatedAt();
}
