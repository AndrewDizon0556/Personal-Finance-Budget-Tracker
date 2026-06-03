package com.iponchallenge.repository;

import com.iponchallenge.entity.SchoolEvent;
import com.iponchallenge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SchoolEventRepository extends JpaRepository<SchoolEvent, UUID> {

    List<SchoolEvent> findByUserOrderByDateAsc(User user);

    List<SchoolEvent> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate from, LocalDate to);

    Optional<SchoolEvent> findByIdAndUser(UUID id, User user);
}
