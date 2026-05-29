package com.iponchallenge.service;

import com.iponchallenge.dto.BudgetRequest;
import com.iponchallenge.dto.BudgetResponse;
import com.iponchallenge.entity.Budget;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.BudgetMapper;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.ExpenseCategoryRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    public List<BudgetResponse> getBudgets(String email, Integer month, Integer year) {
        User user = getUser(email);
        int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();
        int resolvedYear = year != null ? year : LocalDate.now().getYear();
        return budgetRepository.findByUserAndMonthAndYear(user, resolvedMonth, resolvedYear)
                .stream().map(budgetMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(String email, BudgetRequest request) {
        User user = getUser(email);
        ExpenseCategory category = categoryRepository.findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        int month = request.getMonth() != null ? request.getMonth() : LocalDate.now().getMonthValue();
        int year = request.getYear() != null ? request.getYear() : LocalDate.now().getYear();

        if (budgetRepository.existsByUserAndCategoryAndMonthAndYear(user, category, month, year)) {
            throw new BadRequestException("A budget for this category already exists for this month");
        }

        // Calculate how much of this category's budget is already spent
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        // Filter to just this category
        BigDecimal categorySpent = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, start, end)
                .stream()
                .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(category.getId()))
                .map(e -> e.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = request.getBudgetAmount().subtract(categorySpent);

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .budgetAmount(request.getBudgetAmount())
                .remainingBudget(remaining)
                .month(month)
                .year(year)
                .build();

        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse updateBudget(String email, UUID budgetId, BudgetRequest request) {
        User user = getUser(email);
        Budget budget = budgetRepository.findByIdAndUser(budgetId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        BigDecimal oldRemaining = budget.getRemainingBudget();
        BigDecimal oldBudget = budget.getBudgetAmount();
        BigDecimal spent = oldBudget.subtract(oldRemaining);

        budget.setBudgetAmount(request.getBudgetAmount());
        budget.setRemainingBudget(request.getBudgetAmount().subtract(spent));

        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(String email, UUID budgetId) {
        User user = getUser(email);
        Budget budget = budgetRepository.findByIdAndUser(budgetId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
