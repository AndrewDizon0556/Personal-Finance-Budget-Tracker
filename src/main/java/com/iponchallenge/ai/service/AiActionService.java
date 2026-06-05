package com.iponchallenge.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.iponchallenge.ai.dto.ProposedAction;
import com.iponchallenge.ai.entity.AiActionLog;
import com.iponchallenge.ai.repository.AiActionLogRepository;
import com.iponchallenge.dto.ExpenseRequest;
import com.iponchallenge.dto.SavingsGoalRequest;
import com.iponchallenge.entity.CategoryType;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseCategoryRepository;
import com.iponchallenge.repository.UserRepository;
import com.iponchallenge.service.ExpenseService;
import com.iponchallenge.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Bridges AI-proposed actions to the app's real business services — safely.
 *
 * - {@link #propose} validates a model function call and returns a typed action
 *   to confirm; it NEVER writes anything.
 * - {@link #execute} runs ONLY after the user confirms, re-validating every
 *   field, scoping to the authenticated user, delegating to the existing
 *   {@link ExpenseService}/{@link SavingsGoalService}, and logging the result.
 */
@Service
@RequiredArgsConstructor
public class AiActionService {

    private static final BigDecimal MAX_AMOUNT = new BigDecimal("99999999.99");

    private final ExpenseService expenseService;
    private final SavingsGoalService savingsGoalService;
    private final ExpenseCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AiActionLogRepository logRepository;

    /** The Gemini tool schema the model may call. */
    public Object functionDeclarations() {
        return List.of(
                Map.of(
                        "name", "add_transaction",
                        "description", "Record a new income or expense for the user. Use when the user asks to add, log, or record money received or spent.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "transactionType", Map.of("type", "string", "enum", List.of("INCOME", "EXPENSE"),
                                                "description", "INCOME for money received, EXPENSE for money spent"),
                                        "amount", Map.of("type", "number", "description", "Amount in pesos; must be greater than 0"),
                                        "category", Map.of("type", "string", "description", "Category name, e.g. Food, Transportation, Allowance"),
                                        "notes", Map.of("type", "string", "description", "Optional short note"),
                                        "date", Map.of("type", "string", "description", "Date as yyyy-MM-dd; omit for today")
                                ),
                                "required", List.of("transactionType", "amount")
                        )
                ),
                Map.of(
                        "name", "create_savings_goal",
                        "description", "Create a new savings goal. Use when the user asks to save up for something.",
                        "parameters", Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "name", Map.of("type", "string", "description", "Goal name, e.g. New Laptop"),
                                        "targetAmount", Map.of("type", "number", "description", "Target amount in pesos; must be greater than 0"),
                                        "targetDate", Map.of("type", "string", "description", "Optional deadline as yyyy-MM-dd")
                                ),
                                "required", List.of("name", "targetAmount")
                        )
                )
        );
    }

    // ---- propose (validate only, no writes) ----

    public ProposedAction propose(String email, String functionName, JsonNode args) {
        return switch (functionName) {
            case "add_transaction" -> proposeTransaction(args);
            case "create_savings_goal" -> proposeGoal(args);
            default -> throw new BadRequestException("Unsupported action.");
        };
    }

    private ProposedAction proposeTransaction(JsonNode args) {
        String txType = args.path("transactionType").asText("EXPENSE").toUpperCase();
        if (!txType.equals("INCOME") && !txType.equals("EXPENSE")) txType = "EXPENSE";
        BigDecimal amount = validAmount(args.path("amount"), "amount");
        String category = trimToNull(args.path("category").asText(""));
        String notes = trimToNull(args.path("notes").asText(""));
        String date = normalizeDate(args.path("date").asText(""), LocalDate.now().toString());

        boolean income = txType.equals("INCOME");
        String summary = "I'll record ₱" + plain(amount) + " as " + (income ? "income" : "an expense")
                + (category == null ? "" : " under " + category)
                + (date.equals(LocalDate.now().toString()) ? " (today)" : " on " + date)
                + ". Want me to save it?";

        return ProposedAction.builder()
                .type("ADD_TRANSACTION").transactionType(txType).amount(amount)
                .category(category).notes(notes).date(date).summary(summary).build();
    }

    private ProposedAction proposeGoal(JsonNode args) {
        String name = trimToNull(args.path("name").asText(""));
        if (name == null) throw new BadRequestException("a goal name is needed");
        BigDecimal target = validAmount(args.path("targetAmount"), "target amount");
        String targetDate = normalizeDate(args.path("targetDate").asText(""), null);

        String summary = "I'll create a savings goal \"" + name + "\" with a ₱" + plain(target) + " target"
                + (targetDate == null ? "" : " by " + targetDate) + ". Want me to create it?";

        return ProposedAction.builder()
                .type("CREATE_GOAL").goalName(name).targetAmount(target).targetDate(targetDate)
                .summary(summary).build();
    }

    // ---- execute (only after user confirmation) ----

    public String execute(String email, ProposedAction action) {
        String type = action.getType() == null ? "" : action.getType();
        try {
            String result = switch (type) {
                case "ADD_TRANSACTION" -> executeTransaction(email, action);
                case "CREATE_GOAL" -> executeGoal(email, action);
                default -> throw new BadRequestException("Unsupported action.");
            };
            log(email, type, action.getSummary(), "EXECUTED");
            return result;
        } catch (RuntimeException e) {
            log(email, type, e.getMessage(), "FAILED");
            throw e;
        }
    }

    private String executeTransaction(String email, ProposedAction a) {
        TransactionType tt = "INCOME".equalsIgnoreCase(a.getTransactionType())
                ? TransactionType.INCOME : TransactionType.EXPENSE;
        BigDecimal amount = validAmount(a.getAmount(), "amount");

        ExpenseRequest req = new ExpenseRequest();
        req.setAmount(amount);
        req.setNotes(trimToNull(a.getNotes()));
        req.setExpenseDate(parseDate(a.getDate(), LocalDate.now()));
        req.setTransactionType(tt);
        req.setCategoryId(resolveCategoryId(email, a.getCategory(), tt));

        expenseService.createExpense(email, req);
        boolean income = tt == TransactionType.INCOME;
        return "Done ✅ Recorded ₱" + plain(amount) + " as " + (income ? "income" : "an expense")
                + (req.getCategoryId() != null ? " under " + a.getCategory() : "") + ".";
    }

    private String executeGoal(String email, ProposedAction a) {
        if (trimToNull(a.getGoalName()) == null) throw new BadRequestException("a goal name is needed");
        BigDecimal target = validAmount(a.getTargetAmount(), "target amount");

        SavingsGoalRequest req = new SavingsGoalRequest();
        req.setGoalName(a.getGoalName().trim());
        req.setTargetAmount(target);
        req.setTargetDate(parseDate(a.getTargetDate(), null));

        savingsGoalService.createGoal(email, req);
        return "Done ✅ Created savings goal \"" + a.getGoalName().trim() + "\" with a ₱" + plain(target) + " target.";
    }

    /** Matches a category name to one of the user's categories of the right type (or null = uncategorized). */
    private UUID resolveCategoryId(String email, String name, TransactionType tt) {
        if (name == null || name.isBlank()) return null;
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        CategoryType ct = tt == TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
        return categoryRepository.findByUserOrderByNameAsc(user).stream()
                .filter(c -> c.getType() == ct && c.getName().equalsIgnoreCase(name.trim()))
                .map(ExpenseCategory::getId)
                .findFirst()
                .orElse(null);
    }

    private void log(String email, String type, String detail, String status) {
        logRepository.save(AiActionLog.builder()
                .userEmail(email).actionType(type)
                .detail(detail == null ? "" : detail.substring(0, Math.min(detail.length(), 500)))
                .status(status).build());
    }

    // ---- validation helpers ----

    private static BigDecimal validAmount(JsonNode node, String label) {
        return validAmount(node.isNumber() ? node.decimalValue() : null, label);
    }

    private static BigDecimal validAmount(BigDecimal amount, String label) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("the " + label + " must be greater than zero");
        }
        if (amount.compareTo(MAX_AMOUNT) > 0) {
            throw new BadRequestException("the " + label + " is too large");
        }
        return amount.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private static LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) return fallback;
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException e) {
            return fallback;
        }
    }

    private static String normalizeDate(String value, String fallback) {
        LocalDate d = parseDate(value, fallback == null ? null : LocalDate.parse(fallback));
        return d == null ? null : d.toString();
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String plain(BigDecimal v) {
        return v.setScale(2, java.math.RoundingMode.HALF_UP).toPlainString();
    }
}
