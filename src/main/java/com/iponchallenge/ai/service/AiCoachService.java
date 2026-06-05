package com.iponchallenge.ai.service;

import com.iponchallenge.ai.client.GeminiClient;
import com.iponchallenge.ai.config.AiConfig;
import com.iponchallenge.ai.dto.AiCoachRequest;
import com.iponchallenge.ai.dto.AiCoachResponse;
import com.iponchallenge.dto.DashboardResponse;
import com.iponchallenge.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI Coach — turns the user's budget data + question into friendly, practical
 * advice via {@link GeminiClient}. Three modes, picked by request type:
 *   budget_advice      — personalised advice using the current-month snapshot
 *   categorize_expense — classify a description into one category
 *   tutor_question     — answer a general personal-finance question (default)
 */
@Service
@RequiredArgsConstructor
public class AiCoachService {

    private final AiConfig aiConfig;
    private final GeminiClient gemini;
    private final DashboardService dashboardService;

    private static final String SYSTEM_PROMPT = """
            You are "Ipon Coach", a friendly, practical personal-finance assistant inside the
            Ipon Challenge budgeting app. Your users are in the Philippines and budget in pesos (₱)
            — students, workers, and families.
            Style: warm, encouraging, and concrete. Answer in 3–5 short sentences using simple
            language and Filipino-friendly examples. Avoid jargon.
            Rules: give safe, general budgeting and saving guidance only. Never give specific
            investment, tax, legal, or medical advice. Do not invent numbers — only reason from the
            data you are given.
            """;

    public AiCoachResponse coach(String email, AiCoachRequest request) {
        String type = request.getType() == null ? "" : request.getType().trim().toLowerCase();
        String reply = switch (type) {
            case "budget_advice" -> budgetAdvice(email, request.getInput());
            case "categorize_expense" -> categorize(request.getInput());
            default -> tutor(request.getInput()); // tutor_question and anything else
        };
        return AiCoachResponse.builder()
                .reply(reply)
                .type(type.isBlank() ? "tutor_question" : type)
                .model(aiConfig.getModel())
                .build();
    }

    private String budgetAdvice(String email, String question) {
        DashboardResponse d = dashboardService.getDashboard(email);
        String snapshot = """
                The user's current-month snapshot (Philippine pesos):
                - Allowance/income this period: ₱%s
                - Spent so far this month: ₱%s
                - Remaining balance: ₱%s
                - Safe-to-spend per day: ₱%s
                - Days left in the month: %d
                - Runway status: %s
                """.formatted(
                nz(d.getMonthlyAllowance()), nz(d.getTotalSpentThisMonth()), nz(d.getRemainingBalance()),
                nz(d.getDailySafeSpend()), d.getDaysLeftInMonth(),
                d.getRunwayStatus() == null ? "unknown" : d.getRunwayStatus().name());

        String prompt = snapshot
                + "\nThe user asks: " + orDefault(question, "How am I doing with my budget this month?")
                + "\nGive personalised, encouraging budgeting advice based on the snapshot above.";
        return gemini.generate(SYSTEM_PROMPT, prompt, 600);
    }

    private String tutor(String question) {
        String prompt = "Answer this personal-finance question for a beginner: "
                + orDefault(question, "Give me one simple tip to save money.");
        return gemini.generate(SYSTEM_PROMPT, prompt, 600);
    }

    private String categorize(String description) {
        String prompt = """
                Classify this expense into exactly ONE category from this list:
                Food, Transportation, Tuition, School Supplies, Projects, Load/Data, Leisure, Emergency, Income, Other.
                Reply with only the category name — nothing else.
                Expense: %s""".formatted(orDefault(description, ""));
        return gemini.generate("You are an expense classifier. Reply with only the category name.", prompt, 20);
    }

    private static String nz(Object value) {
        return value == null ? "0" : value.toString();
    }

    private static String orDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }
}
