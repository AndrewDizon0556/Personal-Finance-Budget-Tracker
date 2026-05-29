package com.iponchallenge.service;

import com.iponchallenge.entity.Budget;
import com.iponchallenge.entity.SavingsGoal;
import com.iponchallenge.entity.Subscription;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.observer.InAppNotificationObserver;
import com.iponchallenge.observer.NotificationEvent;
import com.iponchallenge.observer.NotificationPublisher;
import com.iponchallenge.observer.NotificationType;
import com.iponchallenge.repository.BudgetRepository;
import com.iponchallenge.repository.SavingsGoalRepository;
import com.iponchallenge.repository.SubscriptionRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final double BUDGET_WARNING_THRESHOLD = 0.20;
    private static final int SUBSCRIPTION_REMINDER_DAYS = 3;

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public List<NotificationEvent> getNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        NotificationPublisher publisher = new NotificationPublisher();
        InAppNotificationObserver observer = new InAppNotificationObserver();
        publisher.addObserver(observer);

        checkBudgetWarnings(user, publisher);
        checkSubscriptionReminders(user, publisher);
        checkGoalCompletions(user, publisher);

        return observer.getEvents();
    }

    private void checkBudgetWarnings(User user, NotificationPublisher publisher) {
        LocalDate today = LocalDate.now();
        budgetRepository.findByUserAndMonthAndYear(user, today.getMonthValue(), today.getYear())
                .forEach(budget -> {
                    if (isBudgetCritical(budget)) {
                        publisher.publish(NotificationEvent.builder()
                                .type(NotificationType.BUDGET_WARNING)
                                .title("Budget Warning: " + budget.getCategory().getName())
                                .message(String.format(
                                        "Only ₱%s remaining in your %s budget.",
                                        budget.getRemainingBudget().toPlainString(),
                                        budget.getCategory().getName()
                                ))
                                .severity("WARNING")
                                .build());
                    }
                });
    }

    private boolean isBudgetCritical(Budget budget) {
        if (budget.getBudgetAmount().compareTo(BigDecimal.ZERO) == 0) return false;
        double ratio = budget.getRemainingBudget()
                .divide(budget.getBudgetAmount(), 4, java.math.RoundingMode.HALF_UP)
                .doubleValue();
        return ratio <= BUDGET_WARNING_THRESHOLD;
    }

    private void checkSubscriptionReminders(User user, NotificationPublisher publisher) {
        LocalDate today = LocalDate.now();
        List<Subscription> upcoming = subscriptionRepository
                .findByUserAndActiveAndRenewalDateBetweenOrderByRenewalDateAsc(
                        user, true, today, today.plusDays(SUBSCRIPTION_REMINDER_DAYS)
                );

        upcoming.forEach(sub -> {
            long days = java.time.temporal.ChronoUnit.DAYS.between(today, sub.getRenewalDate());
            String when = days == 0 ? "today" : "in " + days + " day" + (days == 1 ? "" : "s");
            publisher.publish(NotificationEvent.builder()
                    .type(NotificationType.SUBSCRIPTION_REMINDER)
                    .title("Subscription Renewal: " + sub.getName())
                    .message(String.format("%s (₱%s) renews %s.",
                            sub.getName(), sub.getAmount().toPlainString(), when))
                    .severity(days == 0 ? "CRITICAL" : "INFO")
                    .build());
        });
    }

    private void checkGoalCompletions(User user, NotificationPublisher publisher) {
        savingsGoalRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(goal -> goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0)
                .forEach((SavingsGoal goal) -> publisher.publish(NotificationEvent.builder()
                        .type(NotificationType.GOAL_COMPLETE)
                        .title("Goal Reached: " + goal.getGoalName())
                        .message(String.format(
                                "Congrats! You've reached your ₱%s goal for \"%s\".",
                                goal.getTargetAmount().toPlainString(), goal.getGoalName()
                        ))
                        .severity("INFO")
                        .build()));
    }
}
