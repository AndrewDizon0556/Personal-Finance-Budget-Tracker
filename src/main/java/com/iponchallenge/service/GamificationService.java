package com.iponchallenge.service;

import com.iponchallenge.dto.AchievementDto;
import com.iponchallenge.dto.GamificationResponse;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

/**
 * Computes a student's gamification state (XP, level, streaks, achievements)
 * from their existing activity. Derived on read — no extra persistence required.
 */
@Service
@RequiredArgsConstructor
public class GamificationService {

    private static final int XP_PER_TRANSACTION = 10;
    private static final int XP_PER_COMPLETED_GOAL = 50;
    private static final int XP_PER_ACTIVE_DAY = 5;

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public GamificationResponse getForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<Expense> expenses = expenseRepository.findByUserOrderByExpenseDateDescCreatedAtDesc(user);
        List<SavingsGoal> goals = savingsGoalRepository.findByUserOrderByCreatedAtDesc(user);

        int transactionCount = expenses.size();
        long completedGoals = goals.stream().filter(this::isCompleted).count();

        // Distinct active days (sorted ascending)
        TreeSet<LocalDate> activeDays = new TreeSet<>();
        for (Expense e : expenses) activeDays.add(e.getExpenseDate());

        int currentStreak = computeCurrentStreak(activeDays);
        int longestStreak = computeLongestStreak(activeDays);

        int totalXp = transactionCount * XP_PER_TRANSACTION
                + (int) completedGoals * XP_PER_COMPLETED_GOAL
                + activeDays.size() * XP_PER_ACTIVE_DAY;

        int[] level = computeLevel(totalXp);

        List<AchievementDto> achievements = buildAchievements(
                user, transactionCount, (int) completedGoals, goals.size(),
                currentStreak, longestStreak, level[0]
        );

        return GamificationResponse.builder()
                .level(level[0])
                .xp(totalXp)
                .xpIntoLevel(level[1])
                .xpForNextLevel(level[2])
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalXp(totalXp)
                .achievements(achievements)
                .build();
    }

    private boolean isCompleted(SavingsGoal g) {
        return g.getCurrentAmount() != null
                && g.getCurrentAmount().compareTo(g.getTargetAmount()) >= 0;
    }

    /** @return [level, xpIntoLevel, xpForNextLevel]. Level L requires L*100 XP to advance. */
    private int[] computeLevel(int totalXp) {
        int level = 1;
        int remaining = totalXp;
        int need = 100;
        while (remaining >= need) {
            remaining -= need;
            level++;
            need = level * 100;
        }
        return new int[]{level, remaining, need};
    }

    private int computeCurrentStreak(TreeSet<LocalDate> days) {
        if (days.isEmpty()) return 0;
        LocalDate today = LocalDate.now();
        // Allow a one-day grace: anchor on today, else yesterday.
        LocalDate anchor;
        if (days.contains(today)) anchor = today;
        else if (days.contains(today.minusDays(1))) anchor = today.minusDays(1);
        else return 0;

        int streak = 0;
        LocalDate cursor = anchor;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int computeLongestStreak(TreeSet<LocalDate> days) {
        int longest = 0;
        int run = 0;
        LocalDate prev = null;
        for (LocalDate d : days) {
            if (prev != null && prev.plusDays(1).equals(d)) {
                run++;
            } else {
                run = 1;
            }
            longest = Math.max(longest, run);
            prev = d;
        }
        return longest;
    }

    private List<AchievementDto> buildAchievements(
            User user, int txCount, int completedGoals, int totalGoals,
            int currentStreak, int longestStreak, int level) {

        List<AchievementDto> list = new ArrayList<>();

        list.add(achievement("first_steps", "First Steps", "Log your first transaction", "receipt",
                txCount >= 1));
        list.add(achievement("consistent_logger", "Consistent Logger", "Log 10 transactions", "receipt",
                txCount >= 10));
        list.add(achievement("goal_getter", "Goal Getter", "Create your first savings goal", "target",
                totalGoals >= 1));
        list.add(achievement("tipid_master", "Tipid Master", "Complete a savings goal", "piggy",
                completedGoals >= 1));
        list.add(achievement("budget_warrior", "Budget Warrior", "Build a 7-day logging streak", "shield",
                longestStreak >= 7 || currentStreak >= 7));
        list.add(achievement("deans_lister", "Dean's Lister Saver", "Reach Level 5", "cap",
                level >= 5));

        return list;
    }

    private AchievementDto achievement(String code, String title, String desc, String icon, boolean unlocked) {
        return AchievementDto.builder()
                .code(code)
                .title(title)
                .description(desc)
                .icon(icon)
                .unlocked(unlocked)
                .unlockedAt(unlocked ? LocalDate.now() : null)
                .build();
    }
}
