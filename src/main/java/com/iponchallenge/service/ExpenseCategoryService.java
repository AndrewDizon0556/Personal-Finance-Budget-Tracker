package com.iponchallenge.service;

import com.iponchallenge.dto.ExpenseCategoryRequest;
import com.iponchallenge.dto.ExpenseCategoryResponse;
import com.iponchallenge.entity.CategoryType;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.ExpenseCategoryRepository;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseCategoryService {

    // Everyday spending categories (match the dashboard icons/colors).
    private static final List<String> DEFAULT_EXPENSE_CATEGORIES = List.of(
            "Tuition", "Rent", "Food", "Transportation", "School Supplies",
            "Projects", "Load/Data", "Leisure", "Emergency"
    );

    // Realistic student income sources.
    private static final List<String> DEFAULT_INCOME_CATEGORIES = List.of(
            "Allowance", "Part-Time Job", "Freelance Work", "Online Selling",
            "Tutoring", "Scholarship", "Gift", "Refund", "Others"
    );

    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createDefaultCategories(User user) {
        DEFAULT_EXPENSE_CATEGORIES.forEach(name -> categoryRepository.save(
                ExpenseCategory.builder().user(user).name(name).type(CategoryType.EXPENSE).build()
        ));
        DEFAULT_INCOME_CATEGORIES.forEach(name -> categoryRepository.save(
                ExpenseCategory.builder().user(user).name(name).type(CategoryType.INCOME).build()
        ));
    }

    @Transactional
    public List<ExpenseCategoryResponse> getCategories(String email) {
        User user = getUser(email);
        // Backfill income categories for accounts created before income categories existed.
        ensureIncomeCategories(user);
        // Backfill the "Rent" category for accounts created before it was a default.
        ensureCategory(user, "Rent", CategoryType.EXPENSE);
        return categoryRepository.findByUserOrderByNameAsc(user).stream()
                .map(cat -> ExpenseCategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .type(cat.getType())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseCategoryResponse createCategory(String email, ExpenseCategoryRequest request) {
        User user = getUser(email);
        ExpenseCategory category = ExpenseCategory.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType() != null ? request.getType() : CategoryType.EXPENSE)
                .build();
        ExpenseCategory saved = categoryRepository.save(category);
        return ExpenseCategoryResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .type(saved.getType())
                .build();
    }

    @Transactional
    public void deleteCategory(String email, UUID categoryId) {
        User user = getUser(email);
        ExpenseCategory category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Detach expenses from this category before deleting
        expenseRepository.findByUserOrderByExpenseDateDescCreatedAtDesc(user).stream()
                .filter(e -> e.getCategory() != null && e.getCategory().getId().equals(categoryId))
                .forEach(e -> {
                    e.setCategory(null);
                    expenseRepository.save(e);
                });

        budgetRepository.deleteByCategory(category);
        categoryRepository.delete(category);
    }

    private void ensureIncomeCategories(User user) {
        if (!categoryRepository.existsByUserAndType(user, CategoryType.INCOME)) {
            DEFAULT_INCOME_CATEGORIES.forEach(name -> categoryRepository.save(
                    ExpenseCategory.builder().user(user).name(name).type(CategoryType.INCOME).build()
            ));
        }
    }

    /** Adds a single category for the user if they don't already have it (by name + type). */
    private void ensureCategory(User user, String name, CategoryType type) {
        boolean exists = categoryRepository.findByUserOrderByNameAsc(user).stream()
                .anyMatch(c -> c.getType() == type && c.getName().equalsIgnoreCase(name));
        if (!exists) {
            categoryRepository.save(
                    ExpenseCategory.builder().user(user).name(name).type(type).build());
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
