package com.iponchallenge.mapper;

import com.iponchallenge.dto.SubscriptionResponse;
import com.iponchallenge.entity.Subscription;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class SubscriptionMapper {

    private static final int DUE_SOON_THRESHOLD_DAYS = 3;

    public SubscriptionResponse toResponse(Subscription subscription) {
        int daysUntilRenewal = (int) ChronoUnit.DAYS.between(
                LocalDate.now(), subscription.getRenewalDate()
        );
        boolean dueSoon = subscription.isActive()
                && daysUntilRenewal >= 0
                && daysUntilRenewal <= DUE_SOON_THRESHOLD_DAYS;

        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .name(subscription.getName())
                .amount(subscription.getAmount())
                .renewalDate(subscription.getRenewalDate())
                .active(subscription.isActive())
                .daysUntilRenewal(daysUntilRenewal)
                .dueSoon(dueSoon)
                .paymentStatus(subscription.getPaymentStatus())
                .category(subscription.getCategory())
                .build();
    }
}
