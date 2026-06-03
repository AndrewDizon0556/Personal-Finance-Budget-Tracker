package com.iponchallenge.repository;

import com.iponchallenge.entity.Challenge;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserChallengeProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserChallengeProgressRepository extends JpaRepository<UserChallengeProgress, UUID> {

    List<UserChallengeProgress> findByUserOrderByCreatedAtDesc(User user);

    Optional<UserChallengeProgress> findByUserAndChallenge(User user, Challenge challenge);

    long countByUserAndCompleted(User user, boolean completed);
}
