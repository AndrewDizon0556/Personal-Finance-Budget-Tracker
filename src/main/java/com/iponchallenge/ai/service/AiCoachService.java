package com.iponchallenge.ai.service;

import com.iponchallenge.ai.client.GeminiClient;
import com.iponchallenge.ai.client.GeminiResult;
import com.iponchallenge.ai.config.AiConfig;
import com.iponchallenge.ai.dto.AiCoachRequest;
import com.iponchallenge.ai.dto.AiCoachResponse;
import com.iponchallenge.ai.dto.ProposedAction;
import com.iponchallenge.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * AI Coach — an intelligent financial assistant. It reads the signed-in user's
 * real financial snapshot ({@link FinancialContextService}) and can also PROPOSE
 * actions (add transaction / create goal) via Gemini function calling. Proposed
 * actions are returned for the user to confirm; nothing is written until then.
 */
@Service
@RequiredArgsConstructor
public class AiCoachService {

    private final AiConfig aiConfig;
    private final GeminiClient gemini;
    private final FinancialContextService contextService;
    private final AiActionService actionService;

    private static final String SYSTEM_PROMPT = """
            You are "Ipon Coach", a friendly, practical AI financial assistant inside the Ipon
            Challenge budgeting app. Users are in the Philippines and budget in pesos (₱).

            You are given a SNAPSHOT of the user's real finances (balance, income, expenses by
            category, budgets, savings goals, allowance schedule, runway). Always reason from
            these actual numbers — never invent figures.

            When asked "can I afford X?", weigh the price against the remaining balance, the
            safe-to-spend-per-day, upcoming allowance, and any savings goals; give a clear
            yes/no/maybe with a short reason and the trade-off.

            You can also DO things for the user by calling the provided functions:
              - add_transaction: record an income or expense
              - create_savings_goal: start a new savings goal
            Call a function ONLY when the user clearly asks to add, log, record, or create
            something. The app shows the user a confirmation before anything is saved, so do not
            ask for confirmation yourself — just call the function with the details you have.
            Call at most one function per message. For everything else, reply with advice.

            Style: warm, encouraging, concrete. Keep replies to 3–6 short sentences in simple,
            Filipino-friendly language. Give safe, general budgeting guidance only — never
            specific investment, tax, legal, or medical advice.
            """;

    public AiCoachResponse coach(String email, AiCoachRequest request) {
        String type = request.getType() == null ? "" : request.getType().trim().toLowerCase();

        if ("categorize_expense".equals(type)) {
            return response(categorize(request.getInput()), type, null);
        }

        String fallback = "budget_advice".equals(type)
                ? "How am I doing with my budget this month?"
                : "Give me one simple money-saving tip based on my data.";
        String prompt = contextService.buildContext(email)
                + "\n\nThe user says: " + orDefault(request.getInput(), fallback)
                + "\nIf they are asking to add/record a transaction or create a savings goal, call the"
                + " matching function. Otherwise answer using the snapshot, reasoning from the real numbers.";

        GeminiResult result = gemini.generateWithTools(SYSTEM_PROMPT, prompt, actionService.functionDeclarations(), 700);

        if (result.isFunctionCall()) {
            try {
                ProposedAction action = actionService.propose(email, result.functionName(), result.args());
                return response(action.getSummary(), type, action);
            } catch (BadRequestException e) {
                return response("I couldn't quite set that up — " + e.getMessage()
                        + ". Could you give me the details again?", type, null);
            }
        }
        return response(result.text(), type, null);
    }

    private String categorize(String description) {
        String prompt = """
                Classify this expense into exactly ONE category from this list:
                Food, Transportation, Tuition, School Supplies, Projects, Load/Data, Leisure, Emergency, Income, Other.
                Reply with only the category name — nothing else.
                Expense: %s""".formatted(orDefault(description, ""));
        return gemini.generate("You are an expense classifier. Reply with only the category name.", prompt, 20);
    }

    private AiCoachResponse response(String reply, String type, ProposedAction action) {
        return AiCoachResponse.builder()
                .reply(reply)
                .type(type.isBlank() ? "tutor_question" : type)
                .model(aiConfig.getModel())
                .action(action)
                .build();
    }

    private static String orDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }
}
