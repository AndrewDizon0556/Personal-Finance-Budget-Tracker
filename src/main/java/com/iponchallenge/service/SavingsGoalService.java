package com.iponchallenge.service;

import com.iponchallenge.dto.SavingsGoalRequest;
import com.iponchallenge.dto.SavingsGoalResponse;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SavingsGoalMapper;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavingsGoalService {

    private final SavingsGoalRepository goalRepository;
    private final UserRepository userRepository;
    private final SavingsGoalMapper goalMapper;

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

    @Transactional
    public void deleteGoal(String email, UUID goalId) {
        User user = getUser(email);
        SavingsGoal goal = goalRepository.findByIdAndUser(goalId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
