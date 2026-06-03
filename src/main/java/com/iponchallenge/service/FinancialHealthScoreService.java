package com.iponchallenge.service;

import com.iponchallenge.dto.FinancialHealthScoreResponse;
import com.iponchallenge.dto.FinancialHealthScoreResponse.HealthFactor;
import com.iponchallenge.entity.RunwayStatus;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.EmergencyFundRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserChallengeProgressRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialHealthScoreService {

    private final UserRepository userRepository;
    private final SavingsGoalRepository goalRepository;
    private final BudgetRepository budgetRepository;
    private final EmergencyFundRepository emergencyFundRepository;
    private final UserChallengeProgressRepository challengeProgressRepository;
    private final RunwayService runwayService;

    private static final int MAX_SAVINGS  = 25;
    private static final int MAX_BUDGET   = 25;
    private static final int MAX_SPENDING = 20;
    private static final int MAX_CHALLENGE = 15;
    private static final int MAX_EMERGENCY = 15;

    public FinancialHealthScoreResponse getScore(String email) {
        User user = getUser(email);

        HealthFactor savingsFactor   = scoreSavings(user);
        HealthFactor budgetFactor    = scoreBudget(user);
        HealthFactor spendingFactor  = scoreSpending(email);
        HealthFactor challengeFactor = scoreChallenges(user);
        HealthFactor emergencyFactor = scoreEmergencyFund(user);

        int total = savingsFactor.getPoints() + budgetFactor.getPoints()
                + spendingFactor.getPoints() + challengeFactor.getPoints()
                + emergencyFactor.getPoints();

        String level   = computeLevel(total);
        String message = buildMessage(level, total);
        String tip     = buildTip(savingsFactor, budgetFactor, spendingFactor, emergencyFactor);

        return FinancialHealthScoreResponse.builder()
                .score(total)
                .level(level)
                .message(message)
                .tip(tip)
                .factors(List.of(savingsFactor, budgetFactor, spendingFactor, challengeFactor, emergencyFactor))
                .build();
    }

    private HealthFactor scoreSavings(User user) {
        List<SavingsGoal> goals = goalRepository.findByUserOrderByCreatedAtDesc(user);
        if (goals.isEmpty()) {
            return factor("Savings Habit", 0, MAX_SAVINGS, "POOR", "No savings goals yet. Create one to start building wealth.");
        }
        double avgPct = goals.stream()
                .mapToDouble(g -> g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                        ? g.getCurrentAmount().divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                        : 0.0)
                .average().orElse(0);

        int pts;
        String status;
        String detail;
        if (avgPct >= 80) { pts = MAX_SAVINGS; status = "EXCELLENT"; detail = "Savings goals are well on track!"; }
        else if (avgPct >= 60) { pts = 20; status = "GOOD"; detail = "Good progress on your savings goals."; }
        else if (avgPct >= 40) { pts = 15; status = "FAIR"; detail = "Savings goals exist but progress is slow."; }
        else { pts = 10; status = "FAIR"; detail = "Savings goals created — keep adding funds."; }
        return factor("Savings Habit", pts, MAX_SAVINGS, status, detail);
    }

    private HealthFactor scoreBudget(User user) {
        int month = LocalDate.now().getMonthValue();
        int year  = LocalDate.now().getYear();
        var budgets = budgetRepository.findByUserAndMonthAndYear(user, month, year);
        if (budgets.isEmpty()) {
            return factor("Budget Control", 0, MAX_BUDGET, "POOR", "No budgets set this month. Add a budget to score here.");
        }
        double avgRemaining = budgets.stream()
                .mapToDouble(b -> b.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0
                        ? b.getRemainingBudget().divide(b.getBudgetAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                        : 0.0)
                .average().orElse(0);

        int pts;
        String status;
        String detail;
        if (avgRemaining >= 60) { pts = MAX_BUDGET; status = "EXCELLENT"; detail = "Great budget control — plenty of budget remaining."; }
        else if (avgRemaining >= 40) { pts = 20; status = "GOOD"; detail = "Budget mostly under control."; }
        else if (avgRemaining >= 20) { pts = 12; status = "FAIR"; detail = "Budget running low — watch your spending."; }
        else { pts = 5; status = "POOR"; detail = "Budget nearly exhausted this month."; }
        return factor("Budget Control", pts, MAX_BUDGET, status, detail);
    }

    private HealthFactor scoreSpending(String email) {
        try {
            var runway = runwayService.getRunway(email);
            if (runway.getRunwayStatus() == RunwayStatus.SAFE) {
                return factor("Spending Rate", MAX_SPENDING, MAX_SPENDING, "EXCELLENT", "Your allowance will last until next payout.");
            } else if (runway.getRunwayStatus() == RunwayStatus.WARNING) {
                return factor("Spending Rate", 10, MAX_SPENDING, "FAIR", "Spending faster than expected — ease up.");
            } else {
                return factor("Spending Rate", 0, MAX_SPENDING, "POOR", "Critical! Allowance may run out early.");
            }
        } catch (Exception e) {
            return factor("Spending Rate", MAX_SPENDING, MAX_SPENDING, "GOOD", "No allowance data yet.");
        }
    }

    private HealthFactor scoreChallenges(User user) {
        long completed = challengeProgressRepository.countByUserAndCompleted(user, true);
        long joined    = challengeProgressRepository.findByUserOrderByCreatedAtDesc(user).size();
        int pts;
        String status;
        String detail;
        if (completed >= 3) { pts = MAX_CHALLENGE; status = "EXCELLENT"; detail = completed + " challenges completed!"; }
        else if (completed >= 1) { pts = 10; status = "GOOD"; detail = completed + " challenge(s) completed. Keep going!"; }
        else if (joined > 0) { pts = 5; status = "FAIR"; detail = "Challenge in progress — finish it for full points."; }
        else { pts = 0; status = "POOR"; detail = "Join a challenge to earn points here."; }
        return factor("Challenges", pts, MAX_CHALLENGE, status, detail);
    }

    private HealthFactor scoreEmergencyFund(User user) {
        var funds = emergencyFundRepository.findByUserOrderByCreatedAtDesc(user);
        if (funds.isEmpty()) {
            return factor("Emergency Fund", 0, MAX_EMERGENCY, "POOR", "No emergency fund yet. Even ₱500 helps.");
        }
        double avgPct = funds.stream()
                .mapToDouble(f -> f.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                        ? f.getCurrentAmount().divide(f.getTargetAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                        : 0.0)
                .average().orElse(0);

        int pts;
        String status;
        String detail;
        if (avgPct >= 80) { pts = MAX_EMERGENCY; status = "EXCELLENT"; detail = "Emergency fund is well funded!"; }
        else if (avgPct >= 50) { pts = 10; status = "GOOD"; detail = "Emergency fund is halfway there."; }
        else { pts = 5; status = "FAIR"; detail = "Emergency fund started. Keep contributing."; }
        return factor("Emergency Fund", pts, MAX_EMERGENCY, status, detail);
    }

    private String computeLevel(int score) {
        if (score >= 85) return "EXCELLENT";
        if (score >= 65) return "GOOD";
        if (score >= 40) return "FAIR";
        return "POOR";
    }

    private String buildMessage(String level, int score) {
        return switch (level) {
            case "EXCELLENT" -> "Outstanding! You have excellent financial habits. Score: " + score + "/100.";
            case "GOOD"      -> "Good job! Your finances are in solid shape. Score: " + score + "/100.";
            case "FAIR"      -> "Fair standing. A few improvements will make a big difference. Score: " + score + "/100.";
            default          -> "Your financial health needs attention. Small steps go a long way. Score: " + score + "/100.";
        };
    }

    private String buildTip(HealthFactor savings, HealthFactor budget, HealthFactor spending, HealthFactor emergency) {
        if (emergency.getPoints() == 0) return "Priority: Start an emergency fund — even ₱100 per week adds up.";
        if (savings.getPoints() < 15)   return "Tip: Set a savings goal and contribute a small amount each week.";
        if (budget.getPoints() < 12)    return "Tip: Set monthly budgets per category to track spending better.";
        if (spending.getStatus().equals("POOR")) return "Tip: Reduce daily spending to avoid running out of allowance.";
        return "Keep it up! Consistency is the key to financial health.";
    }

    private HealthFactor factor(String name, int pts, int max, String status, String detail) {
        return HealthFactor.builder()
                .name(name).points(pts).maxPoints(max).status(status).detail(detail)
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
