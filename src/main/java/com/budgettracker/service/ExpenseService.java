package com.budgettracker.service;

import com.budgettracker.dto.ExpenseRequest;
import com.budgettracker.entity.Expense;
import com.budgettracker.entity.User;
import com.budgettracker.exception.BadRequestException;
import com.budgettracker.repository.ExpenseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final AllowanceService allowanceService;
    private final NotificationService notificationService;
    private final UserService userService;

    public ExpenseService(ExpenseRepository expenseRepository,
                          AllowanceService allowanceService,
                          NotificationService notificationService,
                          UserService userService) {
        this.expenseRepository = expenseRepository;
        this.allowanceService = allowanceService;
        this.notificationService = notificationService;
        this.userService = userService;
    }

    public Expense createExpense(UUID userId, ExpenseRequest request) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new BadRequestException("Unknown user"));
        if (request.getDate().isAfter(LocalDate.now())) {
            throw new BadRequestException("Date cannot be in the future");
        }
        BigDecimal remaining = allowanceService.calculateRemainingBalance(user);
        if (request.getAmount().compareTo(remaining) > 0) {
            throw new BadRequestException("Expense exceeds remaining balance");
        }
        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setNotes(request.getNotes());
        expense.setDate(request.getDate());
        expense.setUserId(userId);
        Expense saved = expenseRepository.save(expense);
        notificationService.notifyExpenseAdded(user.getEmail());
        if (allowanceService.calculateRemainingBalance(user).compareTo(BigDecimal.ZERO) <= 0) {
            notificationService.notifyLowBalance(user.getEmail());
        }
        return saved;
    }

    public Page<Expense> getExpenses(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        return expenseRepository.findByUserId(userId, pageable);
    }

    public List<Expense> getExpensesForWindow(UUID userId, LocalDate start, LocalDate end) {
        return expenseRepository.findByUserIdAndDateBetween(userId, start, end);
    }

    public List<Expense> getAllExpenses(UUID userId) {
        return expenseRepository.findByUserId(userId);
    }
}
