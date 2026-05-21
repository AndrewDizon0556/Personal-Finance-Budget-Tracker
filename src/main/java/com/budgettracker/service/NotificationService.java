package com.budgettracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    public void notifyLowBalance(String userEmail) {
        logger.info("LOW_BALANCE event for user: {}", userEmail);
    }

    public void notifyExpenseAdded(String userEmail) {
        logger.info("EXPENSE_ADDED event for user: {}", userEmail);
    }

    public void notifySubscriptionWarning(String userEmail) {
        logger.info("SUBSCRIPTION_WARNING event for user: {}", userEmail);
    }
}
