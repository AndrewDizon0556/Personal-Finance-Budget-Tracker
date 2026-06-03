package com.iponchallenge.repository;

import com.iponchallenge.entity.EmergencyFund;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmergencyFundRepository extends JpaRepository<EmergencyFund, UUID> {

    List<EmergencyFund> findByUserOrderByCreatedAtDesc(User user);

    Optional<EmergencyFund> findByIdAndUser(UUID id, User user);
}
