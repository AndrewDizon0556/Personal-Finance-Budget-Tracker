package com.iponchallenge.ai.service;

import com.iponchallenge.dto.BudgetResponse;
import com.iponchallenge.dto.DashboardResponse;
import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.UnauthorizedException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserRepository;
import com.iponchallenge.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Assembles a compact, read-only snapshot of the signed-in user's finances for
 * the AI Coach — balance, income, expenses by category, budgets, savings goals,
 * allowance schedule, and stats. Scoped strictly to the authenticated user; the
 * AI only ever sees this aggregated text, never another user's data.
 */
@Service
@RequiredArgsConstructor
public class FinancialContextService {

    private static final int TOP_N = 6;

    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final SavingsGoalRepository savingsGoalRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public String buildContext(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        DashboardResponse d = dashboardService.getDashboard(email);

        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        List<Expense> monthTx = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, monthStart, today);

        BigDecimal income = sum(monthTx, TransactionType.INCOME);
        BigDecimal expense = sum(monthTx, TransactionType.EXPENSE);
        Map<String, BigDecimal> expenseByCat = groupByCategory(monthTx, TransactionType.EXPENSE);
        Map<String, BigDecimal> incomeBySrc = groupByCategory(monthTx, TransactionType.INCOME);

        StringBuilder sb = new StringBuilder();
        sb.append("=== USER FINANCIAL SNAPSHOT (Philippine pesos, this month) ===\n");
        sb.append("Remaining balance: ").append(peso(d.getRemainingBalance())).append('\n');
        sb.append("Allowance/income setting: ").append(peso(d.getMonthlyAllowance()))
                .append(" (").append(d.getAllowanceSchedule() == null ? "no schedule" : d.getAllowanceSchedule().name().toLowerCase())
                .append(")\n");
        sb.append("This month — income: ").append(peso(income))
                .append(", expenses: ").append(peso(expense))
                .append(", net: ").append(peso(income.subtract(expense))).append('\n');
        sb.append("Safe-to-spend/day: ").append(peso(d.getDailySafeSpend()))
                .append(", days left in month: ").append(d.getDaysLeftInMonth()).append('\n');
        sb.append("Runway: ").append(d.getRunwayStatus() == null ? "unknown" : d.getRunwayStatus().name())
                .append(" — est. ").append(d.getEstimatedDaysRemaining()).append(" days left; next allowance in ")
                .append(d.getDaysUntilNextAllowance()).append(" days\n");

        appendMap(sb, "Top expense categories", expenseByCat);
        appendMap(sb, "Income sources", incomeBySrc);

        List<BudgetResponse> budgets = d.getBudgets();
        if (budgets != null && !budgets.isEmpty()) {
            sb.append("Budgets: ");
            for (BudgetResponse b : budgets) {
                sb.append(b.getCategoryName()).append(" ").append(peso(b.getSpentAmount()))
                        .append("/").append(peso(b.getBudgetAmount()))
                        .append(" (").append(peso(b.getRemainingBudget())).append(" left); ");
            }
            sb.append('\n');
        }

        List<SavingsGoal> goals = savingsGoalRepository.findByUserOrderByCreatedAtDesc(user);
        if (!goals.isEmpty()) {
            sb.append("Savings goals: ");
            for (SavingsGoal g : goals) {
                sb.append(g.getGoalName()).append(" ").append(peso(g.getCurrentAmount()))
                        .append("/").append(peso(g.getTargetAmount()))
                        .append(" (").append(percent(g.getCurrentAmount(), g.getTargetAmount())).append("%")
                        .append(g.getTargetDate() == null ? "" : ", due " + g.getTargetDate())
                        .append("); ");
            }
            sb.append('\n');
        }

        List<ExpenseResponse> recent = d.getRecentTransactions();
        if (recent != null && !recent.isEmpty()) {
            sb.append("Recent transactions: ");
            recent.stream().limit(TOP_N).forEach(t -> sb.append(t.getExpenseDate()).append(" ")
                    .append(t.getTransactionType()).append(" ").append(peso(t.getAmount()))
                    .append(" ").append(t.getCategoryName()).append("; "));
            sb.append('\n');
        }

        sb.append("=== END SNAPSHOT ===");
        return sb.toString();
    }

    private static BigDecimal sum(List<Expense> txns, TransactionType type) {
        return txns.stream()
                .filter(t -> t.getTransactionType() == type)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static Map<String, BigDecimal> groupByCategory(List<Expense> txns, TransactionType type) {
        Map<String, BigDecimal> map = new TreeMap<>();
        for (Expense t : txns) {
            if (t.getTransactionType() != type) continue;
            String cat = t.getCategory() != null ? t.getCategory().getName() : "Uncategorized";
            map.merge(cat, t.getAmount() == null ? BigDecimal.ZERO : t.getAmount(), BigDecimal::add);
        }
        // Sort by amount descending, keep the top N.
        LinkedHashMap<String, BigDecimal> top = new LinkedHashMap<>();
        map.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(TOP_N)
                .forEach(e -> top.put(e.getKey(), e.getValue()));
        return top;
    }

    private static void appendMap(StringBuilder sb, String label, Map<String, BigDecimal> map) {
        if (map.isEmpty()) return;
        sb.append(label).append(": ");
        map.forEach((k, v) -> sb.append(k).append(" ").append(peso(v)).append("; "));
        sb.append('\n');
    }

    private static String peso(BigDecimal v) {
        return "₱" + (v == null ? "0" : v.setScale(2, RoundingMode.HALF_UP).toPlainString());
    }

    private static int percent(BigDecimal current, BigDecimal target) {
        if (current == null || target == null || target.compareTo(BigDecimal.ZERO) <= 0) return 0;
        return current.multiply(BigDecimal.valueOf(100)).divide(target, 0, RoundingMode.HALF_UP).intValue();
    }
}
