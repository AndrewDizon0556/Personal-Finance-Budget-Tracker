package com.budgettracker.service;

import com.budgettracker.dto.SubscriptionResponse;
import com.budgettracker.entity.Subscription;
import com.budgettracker.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;
    private final NotificationService notificationService;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, NotificationService notificationService) {
        this.subscriptionRepository = subscriptionRepository;
        this.notificationService = notificationService;
    }

    public List<SubscriptionResponse> getUpcomingRenewals(UUID userId) {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(3);
        List<Subscription> subscriptions = subscriptionRepository.findByUserIdAndRenewalDateBetween(userId, today, cutoff);
        if (!subscriptions.isEmpty()) {
            notificationService.notifySubscriptionWarning(userId.toString());
        }
        return subscriptions.stream()
                .map(sub -> new SubscriptionResponse(sub.getId(), sub.getName(), sub.getCost(), sub.getRenewalDate()))
                .collect(Collectors.toList());
    }
}
