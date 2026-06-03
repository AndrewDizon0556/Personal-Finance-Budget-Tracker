package com.iponchallenge.service;

import com.iponchallenge.dto.ExpenseRequest;
import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.entity.Budget;
import com.iponchallenge.entity.CategoryType;
import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.ExpenseMapper;
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
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;

    public List<ExpenseResponse> getExpenses(String email, Integer month, Integer year) {
        User user = getUser(email);

        if (month != null && year != null) {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            return expenseRepository
                    .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, start, end)
                    .stream().map(expenseMapper::toResponse).collect(Collectors.toList());
        }

        return expenseRepository.findByUserOrderByExpenseDateDescCreatedAtDesc(user)
                .stream().map(expenseMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(String email, ExpenseRequest request) {
        User user = getUser(email);
        TransactionType txType = request.getTransactionType() != null
                ? request.getTransactionType() : TransactionType.EXPENSE;
        ExpenseCategory category = resolveCategory(user, request.getCategoryId(), txType);

        Expense expense = Expense.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .notes(request.getNotes())
                .expenseDate(request.getExpenseDate())
                .transactionType(txType)
                .offlineId(request.getOfflineId())
                .lastUpdated(java.time.LocalDateTime.now())
                .build();

        Expense saved = expenseRepository.save(expense);

        if (expense.getTransactionType() == TransactionType.EXPENSE && category != null) {
            deductFromBudget(user, category, saved.getAmount(), saved.getExpenseDate());
        }

        return expenseMapper.toResponse(saved);
    }

    @Transactional
    public ExpenseResponse updateExpense(String email, UUID expenseId, ExpenseRequest request) {
        User user = getUser(email);
        Expense existing = expenseRepository.findByIdAndUser(expenseId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        // Reverse the old budget effect
        if (existing.getTransactionType() == TransactionType.EXPENSE && existing.getCategory() != null) {
            restoreToBudget(user, existing.getCategory(), existing.getAmount(), existing.getExpenseDate());
        }

        TransactionType txType = request.getTransactionType() != null
                ? request.getTransactionType() : TransactionType.EXPENSE;
        ExpenseCategory newCategory = resolveCategory(user, request.getCategoryId(), txType);

        existing.setCategory(newCategory);
        existing.setAmount(request.getAmount());
        existing.setNotes(request.getNotes());
        existing.setExpenseDate(request.getExpenseDate());
        existing.setTransactionType(txType);

        Expense saved = expenseRepository.save(existing);

        // Apply the new budget effect
        if (saved.getTransactionType() == TransactionType.EXPENSE && newCategory != null) {
            deductFromBudget(user, newCategory, saved.getAmount(), saved.getExpenseDate());
        }

        return expenseMapper.toResponse(saved);
    }

    @Transactional
    public void deleteExpense(String email, UUID expenseId) {
        User user = getUser(email);
        Expense expense = expenseRepository.findByIdAndUser(expenseId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (expense.getTransactionType() == TransactionType.EXPENSE && expense.getCategory() != null) {
            restoreToBudget(user, expense.getCategory(), expense.getAmount(), expense.getExpenseDate());
        }

        expenseRepository.delete(expense);
    }

    private void deductFromBudget(User user, ExpenseCategory category, BigDecimal amount, LocalDate date) {
        findBudgetForMonth(user, category, date).ifPresent(budget -> {
            budget.setRemainingBudget(budget.getRemainingBudget().subtract(amount));
            budgetRepository.save(budget);
        });
    }

    private void restoreToBudget(User user, ExpenseCategory category, BigDecimal amount, LocalDate date) {
        findBudgetForMonth(user, category, date).ifPresent(budget -> {
            budget.setRemainingBudget(budget.getRemainingBudget().add(amount));
            budgetRepository.save(budget);
        });
    }

    private Optional<Budget> findBudgetForMonth(User user, ExpenseCategory category, LocalDate date) {
        return budgetRepository.findByUserAndCategoryAndMonthAndYear(
                user, category, date.getMonthValue(), date.getYear()
        );
    }

    private ExpenseCategory resolveCategory(User user, UUID categoryId, TransactionType txType) {
        if (categoryId == null) return null;
        ExpenseCategory category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // A category may only be used with its matching transaction type
        // (income categories for income, expense categories for expenses).
        CategoryType expected = txType == TransactionType.INCOME ? CategoryType.INCOME : CategoryType.EXPENSE;
        if (category.getType() != expected) {
            throw new BadRequestException("Selected category does not match the transaction type");
        }
        return category;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
