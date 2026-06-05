package com.iponchallenge.ai.repository;

import com.iponchallenge.ai.entity.AiActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AiActionLogRepository extends JpaRepository<AiActionLog, UUID> {
}
