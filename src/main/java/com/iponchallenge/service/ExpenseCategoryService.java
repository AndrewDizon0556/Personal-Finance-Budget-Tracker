package com.iponchallenge.service;

import com.iponchallenge.dto.ExpenseCategoryRequest;
import com.iponchallenge.dto.ExpenseCategoryResponse;
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

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Food", "Transportation", "School Supplies", "Entertainment", "Health", "Others"
    );

    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createDefaultCategories(User user) {
        DEFAULT_CATEGORIES.forEach(name -> categoryRepository.save(
                ExpenseCategory.builder().user(user).name(name).build()
        ));
    }

    public List<ExpenseCategoryResponse> getCategories(String email) {
        User user = getUser(email);
        return categoryRepository.findByUserOrderByNameAsc(user).stream()
                .map(cat -> new ExpenseCategoryResponse(cat.getId(), cat.getName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseCategoryResponse createCategory(String email, ExpenseCategoryRequest request) {
        User user = getUser(email);
        ExpenseCategory category = ExpenseCategory.builder()
                .user(user)
                .name(request.getName().trim())
                .build();
        ExpenseCategory saved = categoryRepository.save(category);
        return new ExpenseCategoryResponse(saved.getId(), saved.getName());
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

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
