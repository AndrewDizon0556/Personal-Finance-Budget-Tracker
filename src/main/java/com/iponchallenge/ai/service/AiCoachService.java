package com.iponchallenge.ai.service;

import com.iponchallenge.ai.client.GeminiClient;
import com.iponchallenge.ai.config.AiConfig;
import com.iponchallenge.ai.dto.AiCoachRequest;
import com.iponchallenge.ai.dto.AiCoachResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI Coach — an intelligent financial assistant. It reads the signed-in user's
 * real financial snapshot (via {@link FinancialContextService}) and answers
 * questions grounded in those numbers (e.g. "Can I afford this?"). Three modes:
 *   budget_advice      — personalised advice from the snapshot
 *   categorize_expense — classify a description into one category (no data)
 *   tutor_question     — general finance Q&A, also grounded in the snapshot
 */
@Service
@RequiredArgsConstructor
public class AiCoachService {

    private final AiConfig aiConfig;
    private final GeminiClient gemini;
    private final FinancialContextService contextService;

    private static final String SYSTEM_PROMPT = """
            You are "Ipon Coach", a friendly, practical AI financial assistant inside the Ipon
            Challenge budgeting app. Users are in the Philippines and budget in pesos (₱).

            You are given a SNAPSHOT of the user's real finances (balance, income, expenses by
            category, budgets, savings goals, allowance schedule, runway). Always reason from
            these actual numbers — never invent figures.

            When asked "can I afford X?", weigh the price against the remaining balance, the
            safe-to-spend-per-day, upcoming allowance, and any savings goals; give a clear
            yes/no/maybe with a short reason and the trade-off.

            Style: warm, encouraging, concrete. Answer in 3–6 short sentences with simple,
            Filipino-friendly language. Give safe, general budgeting guidance only — never
            specific investment, tax, legal, or medical advice.

            You can READ the user's data but cannot YET make changes. If they ask you to add,
            edit, or create something (income, expense, goal), briefly tell them you can guide
            them and that they can record it with the + button for now.
            """;

    public AiCoachResponse coach(String email, AiCoachRequest request) {
        String type = request.getType() == null ? "" : request.getType().trim().toLowerCase();
        String reply = switch (type) {
            case "categorize_expense" -> categorize(request.getInput());
            case "budget_advice" -> answerWithContext(email, request.getInput(),
                    "How am I doing with my budget this month?");
            default -> answerWithContext(email, request.getInput(),
                    "Give me one simple money-saving tip based on my data.");
        };
        return AiCoachResponse.builder()
                .reply(reply)
                .type(type.isBlank() ? "tutor_question" : type)
                .model(aiConfig.getModel())
                .build();
    }

    /** Answers a question grounded in the user's live financial snapshot. */
    private String answerWithContext(String email, String question, String fallbackQuestion) {
        String context = contextService.buildContext(email);
        String prompt = context
                + "\n\nThe user asks: " + orDefault(question, fallbackQuestion)
                + "\nAnswer using the snapshot above — reason from the real numbers.";
        return gemini.generate(SYSTEM_PROMPT, prompt, 700);
    }

    private String categorize(String description) {
        String prompt = """
                Classify this expense into exactly ONE category from this list:
                Food, Transportation, Tuition, School Supplies, Projects, Load/Data, Leisure, Emergency, Income, Other.
                Reply with only the category name — nothing else.
                Expense: %s""".formatted(orDefault(description, ""));
        return gemini.generate("You are an expense classifier. Reply with only the category name.", prompt, 20);
    }

    private static String orDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }
}
