package com.iponchallenge.service;

import com.iponchallenge.dto.GoalContributionRequest;
import com.iponchallenge.dto.SavingsGoalRequest;
import com.iponchallenge.dto.SavingsGoalResponse;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SavingsGoalMapper;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SavingsGoalMapper goalMapper;
    private final ExpenseRepository expenseRepository;
    private final RunwayService runwayService;

    public List<SavingsGoalResponse> getGoals(String email) {
        User user = getUser(email);
        return goalRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(goalMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SavingsGoalResponse createGoal(String email, SavingsGoalRequest request) {
        User user = getUser(email);
        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .goalName(request.getGoalName().trim())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null
                        ? request.getCurrentAmount() : BigDecimal.ZERO)
                .targetDate(request.getTargetDate())
                .build();
        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Transactional
    public SavingsGoalResponse updateGoal(String email, UUID goalId, SavingsGoalRequest request) {
        User user = getUser(email);
        SavingsGoal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goal.setGoalName(request.getGoalName().trim());
        goal.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        goal.setTargetDate(request.getTargetDate());

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    /**
     * "Add Money": move {@code amount} from the spendable wallet into this goal.
     * The amount may not exceed the user's current remaining balance. Records a
     * GOAL_CONTRIBUTION ledger row (so it shows in history and lowers the balance)
     * and bumps the goal's saved amount.
     */
    @Transactional
    public SavingsGoalResponse contribute(String email, UUID goalId, GoalContributionRequest request) {
        User user = getUser(email);
        SavingsGoal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Enter an amount greater than zero.");
        }

        BigDecimal remaining = runwayService.getRunway(email).getRemainingBalance();
        if (amount.compareTo(remaining) > 0) {
            throw new BadRequestException(
                    "That's more than your remaining balance of ₱" + remaining.toPlainString() + ".");
        }

        Expense contribution = Expense.builder()
                .user(user)
                .category(null)
                .amount(amount)
                .notes("Saved to " + goal.getGoalName())
                .expenseDate(LocalDate.now())
                .transactionType(TransactionType.GOAL_CONTRIBUTION)
                .goalId(goal.getId())
                .lastUpdated(LocalDateTime.now())
                .build();
        expenseRepository.save(contribution);

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        goal.setLastUpdated(LocalDateTime.now());
        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Transactional
    public void deleteGoal(String email, UUID goalId) {
        User user = getUser(email);
        SavingsGoal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        // Reverse the goal's contributions so the money returns to the wallet
        // (deleting the GOAL_CONTRIBUTION ledger rows lifts them out of the balance).
        List<Expense> contributions = expenseRepository.findByUserAndGoalId(user, goalId);
        if (!contributions.isEmpty()) {
            expenseRepository.deleteAll(contributions);
        }

        goalRepository.delete(goal);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
