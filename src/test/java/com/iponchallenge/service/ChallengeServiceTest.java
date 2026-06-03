package com.iponchallenge.service;

import com.iponchallenge.dto.ChallengeResponse;
import com.iponchallenge.entity.Challenge;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserChallengeProgress;
import com.iponchallenge.repository.ChallengeRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserChallengeProgressRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChallengeServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private ChallengeRepository challengeRepository;
    @Mock private UserChallengeProgressRepository progressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ExpenseRepository expenseRepository;

    @InjectMocks private ChallengeService challengeService;

    private User user;
    private Challenge challenge;

    @BeforeEach
    void setUp() {
        user = User.builder().email(EMAIL).build();
        challenge = Challenge.builder()
                .id(UUID.randomUUID())
                .title("No Milk Tea Challenge")
                .description("7 days without milk tea.")
                .targetDays(7)
                .rewardXp(100)
                .type("NO_SPEND")
                .active(true)
                .build();

        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    @Test
    void joinChallenge_createsProgressRecord() {
        when(challengeRepository.findById(challenge.getId())).thenReturn(Optional.of(challenge));
        when(progressRepository.findByUserAndChallenge(user, challenge)).thenReturn(Optional.empty());
        when(progressRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(Collections.emptyList());
        when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(expenseRepository.sumByUserAndDateBetweenAndType(any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(BigDecimal.ZERO);

        ChallengeResponse response = challengeService.joinChallenge(EMAIL, challenge.getId());

        assertThat(response.isJoined()).isTrue();
        assertThat(response.isCompleted()).isFalse();
    }

    @Test
    void progressPercentage_isComputedFromCurrentAndTarget() {
        when(challengeRepository.findByActiveOrderByCreatedAtAsc(true))
                .thenReturn(java.util.List.of(challenge));

        UserChallengeProgress progress = UserChallengeProgress.builder()
                .user(user).challenge(challenge)
                .startDate(LocalDate.now().minusDays(3))
                .currentProgress(3)
                .completed(false)
                .build();

        when(progressRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(java.util.List.of(progress));

        ChallengeResponse response = challengeService.getChallenges(EMAIL).get(0);

        assertThat(response.getCurrentProgress()).isEqualTo(3);
        assertThat(response.getProgressPercentage()).isCloseTo(42.85, org.assertj.core.api.Assertions.within(0.1));
    }

    @Test
    void updateProgress_marksCompleted_whenProgressReachesTarget() {
        UserChallengeProgress progress = UserChallengeProgress.builder()
                .user(user).challenge(challenge)
                .startDate(LocalDate.now().minusDays(7))
                .currentProgress(6)
                .completed(false)
                .build();

        when(challengeRepository.findById(challenge.getId())).thenReturn(Optional.of(challenge));
        when(progressRepository.findByUserAndChallenge(user, challenge)).thenReturn(Optional.of(progress));
        when(progressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        // Stub all date-range queries to return 0 (all no-spend days)
        when(expenseRepository.sumByUserAndDateBetweenAndType(any(), any(), any(), eq(TransactionType.EXPENSE)))
                .thenReturn(BigDecimal.ZERO);

        ChallengeResponse response = challengeService.updateProgress(EMAIL, challenge.getId());

        assertThat(response.isCompleted()).isTrue();
        assertThat(response.getProgressPercentage()).isEqualTo(100.0);
    }

    @Test
    void getChallenges_returnsNotJoined_whenNoProgress() {
        when(challengeRepository.findByActiveOrderByCreatedAtAsc(true))
                .thenReturn(java.util.List.of(challenge));
        when(progressRepository.findByUserOrderByCreatedAtDesc(user))
                .thenReturn(Collections.emptyList());

        var list = challengeService.getChallenges(EMAIL);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).isJoined()).isFalse();
        assertThat(list.get(0).getProgressPercentage()).isEqualTo(0.0);
    }
}
