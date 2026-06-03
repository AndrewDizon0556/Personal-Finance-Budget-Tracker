package com.iponchallenge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iponchallenge.dto.*;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final ExpenseService expenseService;
    private final BudgetService budgetService;
    private final SavingsGoalService savingsGoalService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public SyncResponseDto sync(String email, SyncRequestDto request) {
        getUser(email); // validate user exists before processing any items

        List<String> synced     = new ArrayList<>();
        List<String> failed     = new ArrayList<>();
        List<SyncResponseDto.IdMappingDto> idMappings = new ArrayList<>();

        for (SyncItemDto item : request.getItems()) {
            try {
                String serverId = processItem(email, item);
                synced.add(item.getQueueId());
                if ("CREATE".equals(item.getOperation()) && serverId != null) {
                    idMappings.add(new SyncResponseDto.IdMappingDto(item.getOfflineId(), serverId));
                }
            } catch (Exception e) {
                log.warn("Sync failed for item queueId={} offlineId={}: {}", item.getQueueId(), item.getOfflineId(), e.getMessage());
                failed.add(item.getQueueId());
            }
        }

        return SyncResponseDto.builder()
                .synced(synced)
                .failed(failed)
                .idMappings(idMappings)
                .build();
    }

    /** Returns the server-assigned ID for CREATE operations, null otherwise. */
    private String processItem(String email, SyncItemDto item) {
        return switch (item.getEntity()) {
            case "expense" -> processExpense(email, item);
            case "budget"  -> processBudget(email, item);
            case "goal"    -> processGoal(email, item);
            default        -> throw new BadRequestException("Unknown entity: " + item.getEntity());
        };
    }

    private String processExpense(String email, SyncItemDto item) {
        return switch (item.getOperation()) {
            case "CREATE" -> {
                ExpenseRequest req = convert(item.getPayload(), ExpenseRequest.class);
                req.setOfflineId(item.getOfflineId());
                ExpenseResponse res = expenseService.createExpense(email, req);
                yield res.getId().toString();
            }
            case "UPDATE" -> {
                String id = getString(item.getPayload(), "id");
                ExpenseRequest req = convert(item.getPayload(), ExpenseRequest.class);
                expenseService.updateExpense(email, UUID.fromString(id), req);
                yield null;
            }
            case "DELETE" -> {
                String id = getString(item.getPayload(), "id");
                expenseService.deleteExpense(email, UUID.fromString(id));
                yield null;
            }
            default -> throw new BadRequestException("Unknown operation: " + item.getOperation());
        };
    }

    private String processBudget(String email, SyncItemDto item) {
        return switch (item.getOperation()) {
            case "CREATE" -> {
                BudgetRequest req = convert(item.getPayload(), BudgetRequest.class);
                BudgetResponse res = budgetService.createBudget(email, req);
                yield res.getId().toString();
            }
            case "UPDATE" -> {
                String id = getString(item.getPayload(), "id");
                BudgetRequest req = convert(item.getPayload(), BudgetRequest.class);
                budgetService.updateBudget(email, UUID.fromString(id), req);
                yield null;
            }
            case "DELETE" -> {
                String id = getString(item.getPayload(), "id");
                budgetService.deleteBudget(email, UUID.fromString(id));
                yield null;
            }
            default -> throw new BadRequestException("Unknown operation: " + item.getOperation());
        };
    }

    private String processGoal(String email, SyncItemDto item) {
        return switch (item.getOperation()) {
            case "CREATE" -> {
                SavingsGoalRequest req = convert(item.getPayload(), SavingsGoalRequest.class);
                SavingsGoalResponse res = savingsGoalService.createGoal(email, req);
                yield res.getId().toString();
            }
            case "UPDATE" -> {
                String id = getString(item.getPayload(), "id");
                SavingsGoalRequest req = convert(item.getPayload(), SavingsGoalRequest.class);
                savingsGoalService.updateGoal(email, UUID.fromString(id), req);
                yield null;
            }
            case "DELETE" -> {
                String id = getString(item.getPayload(), "id");
                savingsGoalService.deleteGoal(email, UUID.fromString(id));
                yield null;
            }
            default -> throw new BadRequestException("Unknown operation: " + item.getOperation());
        };
    }

    private <T> T convert(Object payload, Class<T> clazz) {
        return objectMapper.convertValue(payload, clazz);
    }

    private String getString(Object payload, String key) {
        Object value = ((java.util.Map<?, ?>) payload).get(key);
        if (value == null) throw new BadRequestException("Missing '" + key + "' in sync payload");
        return value.toString();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
