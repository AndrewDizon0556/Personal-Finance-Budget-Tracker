package com.budgettracker.repository;

import com.budgettracker.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByUserIdAndRenewalDateBetween(UUID userId, LocalDate start, LocalDate end);
}
