package com.iponchallenge.service;

import com.iponchallenge.dto.ExpenseRequest;
import com.iponchallenge.dto.ExpenseResponse;
import com.iponchallenge.dto.SubscriptionRequest;
import com.iponchallenge.dto.SubscriptionResponse;
import com.iponchallenge.entity.CategoryType;
import com.iponchallenge.entity.ExpenseCategory;
import com.iponchallenge.entity.PaymentStatus;
import com.iponchallenge.entity.Subscription;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SubscriptionMapper;
import com.iponchallenge.repository.ExpenseCategoryRepository;
import com.iponchallenge.repository.SubscriptionRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final ExpenseService expenseService;
    private final ExpenseCategoryRepository categoryRepository;

    public List<SubscriptionResponse> getSubscriptions(String email) {
        User user = getUser(email);
        return subscriptionRepository.findByUserOrderByRenewalDateAsc(user)
                .stream().map(subscriptionMapper::toResponse).collect(Collectors.toList());
    }

    public List<SubscriptionResponse> getUpcomingRenewals(String email, int daysAhead) {
        User user = getUser(email);
        LocalDate today = LocalDate.now();
        return subscriptionRepository.findByUserAndActiveAndRenewalDateBetweenOrderByRenewalDateAsc(
                        user, true, today, today.plusDays(daysAhead)
                )
                .stream().map(subscriptionMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionResponse createSubscription(String email, SubscriptionRequest request) {
        User user = getUser(email);
        Subscription sub = Subscription.builder()
                .user(user)
                .name(request.getName().trim())
                .amount(request.getAmount())
                .renewalDate(request.getRenewalDate())
                .active(request.isActive())
                .category(trimToNull(request.getCategory()))
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        return subscriptionMapper.toResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse updateSubscription(String email, UUID id, SubscriptionRequest request) {
        User user = getUser(email);
        Subscription sub = findOwned(user, id);

        sub.setName(request.getName().trim());
        sub.setAmount(request.getAmount());
        sub.setRenewalDate(request.getRenewalDate());
        sub.setActive(request.isActive());
        sub.setCategory(trimToNull(request.getCategory()));

        return subscriptionMapper.toResponse(subscriptionRepository.save(sub));
    }

    /**
     * Changes a subscription's payment status, keeping balance + history in sync.
     *
     * - PAID: records an expense (deducting balance, appearing in history) — but only
     *   if not already paid, so there's no duplicate deduction.
     * - PENDING: reverses the recorded expense (restoring balance) if one exists.
     */
    @Transactional
    public SubscriptionResponse updateStatus(String email, UUID id, PaymentStatus status) {
        User user = getUser(email);
        Subscription sub = findOwned(user, id);

        if (status == PaymentStatus.PAID) {
            // Already paid with a recorded expense → no duplicate deduction.
            if (sub.getPaymentStatus() != PaymentStatus.PAID || sub.getPaidExpenseId() == null) {
                ExpenseRequest req = new ExpenseRequest();
                req.setAmount(sub.getAmount());
                req.setNotes(sub.getName() + " Subscription");
                req.setExpenseDate(LocalDate.now());
                req.setTransactionType(TransactionType.EXPENSE);
                req.setCategoryId(resolveCategoryId(user, sub.getCategory()));
                ExpenseResponse expense = expenseService.createExpense(email, req);
                sub.setPaidExpenseId(expense.getId());
                sub.setPaymentStatus(PaymentStatus.PAID);
            }
        } else { // PENDING
            if (sub.getPaymentStatus() == PaymentStatus.PAID && sub.getPaidExpenseId() != null) {
                // Reverse the deduction so the balance is restored.
                try {
                    expenseService.deleteExpense(email, sub.getPaidExpenseId());
                } catch (ResourceNotFoundException ignored) {
                    // Expense already removed elsewhere — just clear the link.
                }
                sub.setPaidExpenseId(null);
            }
            sub.setPaymentStatus(PaymentStatus.PENDING);
        }

        return subscriptionMapper.toResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public void deleteSubscription(String email, UUID id) {
        User user = getUser(email);
        Subscription sub = findOwned(user, id);
        subscriptionRepository.delete(sub);
    }

    /** Resolves a category name to the user's matching EXPENSE category id (or null). */
    private UUID resolveCategoryId(User user, String name) {
        if (name == null || name.isBlank()) return null;
        return categoryRepository.findByUserOrderByNameAsc(user).stream()
                .filter(c -> c.getType() == CategoryType.EXPENSE && c.getName().equalsIgnoreCase(name.trim()))
                .map(ExpenseCategory::getId)
                .findFirst()
                .orElse(null);
    }

    private Subscription findOwned(User user, UUID id) {
        return subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
