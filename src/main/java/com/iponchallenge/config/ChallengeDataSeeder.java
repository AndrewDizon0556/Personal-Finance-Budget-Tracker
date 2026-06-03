package com.iponchallenge.config;

import com.iponchallenge.entity.Challenge;
import com.iponchallenge.repository.ChallengeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/** Seeds student-focused no-spend and savings challenges on first boot. Idempotent. */
@Component
@RequiredArgsConstructor
public class ChallengeDataSeeder implements ApplicationRunner {

    private final ChallengeRepository challengeRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (challengeRepository.count() > 0) return;
        challengeRepository.saveAll(buildChallenges());
    }

    private List<Challenge> buildChallenges() {
        return List.of(
            challenge("No Milk Tea Challenge",
                "Go 7 days without buying milk tea or any coffee shop drinks.",
                7, 100, "NO_SPEND", null),

            challenge("Save ₱50 Daily",
                "Set aside ₱50 every day for 30 days and build a ₱1,500 mini fund.",
                30, 300, "SAVINGS_TARGET", new BigDecimal("1500")),

            challenge("No Impulse Buys",
                "7 days of only buying what you planned. No unplanned purchases.",
                7, 75, "NO_SPEND", null),

            challenge("Pack Your Own Lunch",
                "Bring lunch from home for 5 school days. Save on canteen costs.",
                5, 50, "STREAK", null),

            challenge("Zero Unnecessary Spending",
                "Spend only on essentials — food, transport, load — for 3 straight days.",
                3, 40, "NO_SPEND", null),

            challenge("Weekly ₱100 Savings Challenge",
                "Save ₱100 every week for 4 weeks and prove consistency pays off.",
                28, 200, "SAVINGS_TARGET", new BigDecimal("400")),

            challenge("7-Day Logging Streak",
                "Log at least one transaction every day for 7 days.",
                7, 70, "STREAK", null),

            challenge("30-Day Saving Streak",
                "Log your expenses every single day for 30 days and build the habit.",
                30, 500, "STREAK", null)
        );
    }

    private Challenge challenge(String title, String desc, int days, int xp,
                                 String type, BigDecimal targetAmount) {
        return Challenge.builder()
                .title(title)
                .description(desc)
                .targetDays(days)
                .rewardXp(xp)
                .type(type)
                .targetAmount(targetAmount)
                .active(true)
                .build();
    }
}
