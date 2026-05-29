package com.iponchallenge.repository;

import com.iponchallenge.entity.Subscription;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    List<Subscription> findByUserOrderByRenewalDateAsc(User user);

    List<Subscription> findByUserAndActiveOrderByRenewalDateAsc(User user, boolean active);

    List<Subscription> findByUserAndActiveAndRenewalDateBetweenOrderByRenewalDateAsc(
            User user, boolean active, LocalDate start, LocalDate end
    );

    Optional<Subscription> findByIdAndUser(UUID id, User user);
}
