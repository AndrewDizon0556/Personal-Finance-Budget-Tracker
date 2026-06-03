package com.iponchallenge.service;

import com.iponchallenge.dto.ChallengeResponse;
import com.iponchallenge.entity.Challenge;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.entity.UserChallengeProgress;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.repository.ChallengeRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserChallengeProgressRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserChallengeProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public List<ChallengeResponse> getChallenges(String email) {
        User user = getUser(email);
        List<Challenge> challenges = challengeRepository.findByActiveOrderByCreatedAtAsc(true);

        Map<UUID, UserChallengeProgress> progressMap = progressRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .collect(Collectors.toMap(p -> p.getChallenge().getId(), p -> p));

        return challenges.stream()
                .map(c -> toResponse(c, progressMap.get(c.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChallengeResponse joinChallenge(String email, UUID challengeId) {
        User user = getUser(email);
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));

        if (progressRepository.findByUserAndChallenge(user, challenge).isPresent()) {
            throw new BadRequestException("You have already joined this challenge");
        }

        UserChallengeProgress progress = UserChallengeProgress.builder()
                .user(user)
                .challenge(challenge)
                .startDate(LocalDate.now())
                .currentProgress(0)
                .completed(false)
                .build();

        progressRepository.save(progress);

        // For NO_SPEND challenges, auto-calculate current progress from expense data
        if ("NO_SPEND".equals(challenge.getType())) {
            int noSpendDays = computeNoSpendDays(user, LocalDate.now());
            progress.setCurrentProgress(noSpendDays);
            progressRepository.save(progress);
        }

        return toResponse(challenge, progress);
    }

    @Transactional
    public ChallengeResponse updateProgress(String email, UUID challengeId) {
        User user = getUser(email);
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));

        UserChallengeProgress progress = progressRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new BadRequestException("You have not joined this challenge"));

        if (progress.isCompleted()) {
            return toResponse(challenge, progress);
        }

        int newProgress = computeProgress(user, challenge, progress);
        progress.setCurrentProgress(newProgress);

        boolean justCompleted = newProgress >= challenge.getTargetDays();
        if (justCompleted && !progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDate.now());
        }

        progressRepository.save(progress);
        return toResponse(challenge, progress);
    }

    @Transactional
    public void leaveChallenge(String email, UUID challengeId) {
        User user = getUser(email);
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found"));
        UserChallengeProgress progress = progressRepository.findByUserAndChallenge(user, challenge)
                .orElseThrow(() -> new BadRequestException("You have not joined this challenge"));
        progressRepository.delete(progress);
    }

    /** Compute progress based on challenge type. */
    private int computeProgress(User user, Challenge challenge, UserChallengeProgress progress) {
        LocalDate start = progress.getStartDate();
        return switch (challenge.getType()) {
            case "NO_SPEND" -> computeNoSpendDays(user, start);
            case "STREAK" -> computeStreak(user, start);
            case "SAVINGS_TARGET" -> computeSavingsProgress(user, challenge, start);
            default -> progress.getCurrentProgress();
        };
    }

    /** Counts consecutive no-spend days from start date. */
    private int computeNoSpendDays(User user, LocalDate start) {
        LocalDate today = LocalDate.now();
        int count = 0;
        LocalDate cursor = start;
        while (!cursor.isAfter(today)) {
            BigDecimal daySpend = expenseRepository.sumByUserAndDateBetweenAndType(
                    user, cursor, cursor, TransactionType.EXPENSE);
            if (daySpend.compareTo(BigDecimal.ZERO) > 0) break;
            count++;
            cursor = cursor.plusDays(1);
        }
        return count;
    }

    /** Counts days between start and today with at least one transaction (logging streak). */
    private int computeStreak(User user, LocalDate start) {
        LocalDate today = LocalDate.now();
        int count = 0;
        LocalDate cursor = start;
        while (!cursor.isAfter(today)) {
            BigDecimal daySums = expenseRepository.sumByUserAndDateBetweenAndType(
                    user, cursor, cursor, TransactionType.EXPENSE);
            if (daySums.compareTo(BigDecimal.ZERO) > 0) {
                count++;
            } else {
                break;
            }
            cursor = cursor.plusDays(1);
        }
        return count;
    }

    /** Converts saved income amount to "days" equivalent (targetAmount / targetDays = daily target). */
    private int computeSavingsProgress(User user, Challenge challenge, LocalDate start) {
        if (challenge.getTargetAmount() == null || challenge.getTargetAmount().compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }
        LocalDate today = LocalDate.now();
        BigDecimal totalIncome = expenseRepository.sumByUserAndDateBetweenAndType(
                user, start, today, TransactionType.INCOME);
        BigDecimal dailyTarget = challenge.getTargetAmount()
                .divide(BigDecimal.valueOf(challenge.getTargetDays()), 0, java.math.RoundingMode.CEILING);
        if (dailyTarget.compareTo(BigDecimal.ZERO) == 0) return 0;
        return totalIncome.divide(dailyTarget, 0, java.math.RoundingMode.FLOOR).intValue();
    }

    private ChallengeResponse toResponse(Challenge c, UserChallengeProgress progress) {
        int current = progress != null ? progress.getCurrentProgress() : 0;
        double pct = c.getTargetDays() > 0 ? Math.min((current * 100.0 / c.getTargetDays()), 100.0) : 0;

        return ChallengeResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .targetDays(c.getTargetDays())
                .rewardXp(c.getRewardXp())
                .type(c.getType())
                .targetAmount(c.getTargetAmount())
                .active(c.isActive())
                .joined(progress != null)
                .completed(progress != null && progress.isCompleted())
                .currentProgress(current)
                .progressPercentage(pct)
                .startDate(progress != null ? progress.getStartDate() : null)
                .completedAt(progress != null && progress.isCompleted() ? progress.getCompletedAt() : null)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
