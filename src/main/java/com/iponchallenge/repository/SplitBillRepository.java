package com.iponchallenge.repository;

import com.iponchallenge.entity.SplitBill;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SplitBillRepository extends JpaRepository<SplitBill, UUID> {

    List<SplitBill> findByUserOrderByCreatedAtDesc(User user);

    Optional<SplitBill> findByIdAndUser(UUID id, User user);
}
