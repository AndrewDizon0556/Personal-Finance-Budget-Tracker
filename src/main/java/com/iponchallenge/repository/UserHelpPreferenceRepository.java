package com.iponchallenge.repository;

import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserHelpPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserHelpPreferenceRepository extends JpaRepository<UserHelpPreference, UUID> {

    List<UserHelpPreference> findByUser(User user);

    Optional<UserHelpPreference> findByUserAndGuideName(User user, String guideName);

    void deleteByUser(User user);
}
