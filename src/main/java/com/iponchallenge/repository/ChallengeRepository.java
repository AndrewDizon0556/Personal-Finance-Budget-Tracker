package com.iponchallenge.repository;

import com.iponchallenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    List<Challenge> findByActiveOrderByCreatedAtAsc(boolean active);

    boolean existsByTitle(String title);
}
