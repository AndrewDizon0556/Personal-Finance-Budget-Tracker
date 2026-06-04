package com.iponchallenge.service;

import com.iponchallenge.dto.HelpPreferenceRequest;
import com.iponchallenge.dto.HelpPreferenceResponse;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserHelpPreference;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.UserHelpPreferenceRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HelpPreferenceService {

    private final UserHelpPreferenceRepository helpPreferenceRepository;
    private final UserRepository userRepository;

    public List<HelpPreferenceResponse> getPreferences(String email) {
        User user = getUser(email);
        return helpPreferenceRepository.findByUser(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Upsert a single guide's state — marks it seen/completed and refreshes lastShown. */
    @Transactional
    public HelpPreferenceResponse upsert(String email, HelpPreferenceRequest request) {
        User user = getUser(email);
        String guideName = request.getGuideName().trim();

        UserHelpPreference pref = helpPreferenceRepository.findByUserAndGuideName(user, guideName)
                .orElseGet(() -> UserHelpPreference.builder().user(user).guideName(guideName).build());

        pref.setCompleted(request.isCompleted());
        pref.setLastShown(Instant.now());

        return toResponse(helpPreferenceRepository.save(pref));
    }

    /** Wipe all guidance state so every tour and tip can play again from scratch. */
    @Transactional
    public void resetAll(String email) {
        User user = getUser(email);
        helpPreferenceRepository.deleteByUser(user);
    }

    private HelpPreferenceResponse toResponse(UserHelpPreference p) {
        return HelpPreferenceResponse.builder()
                .id(p.getId())
                .guideName(p.getGuideName())
                .completed(p.isCompleted())
                .lastShown(p.getLastShown())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
