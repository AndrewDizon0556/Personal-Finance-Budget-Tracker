package com.iponchallenge.service;

import com.iponchallenge.dto.SubscriptionRequest;
import com.iponchallenge.dto.SubscriptionResponse;
import com.iponchallenge.entity.Subscription;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SubscriptionMapper;
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
                .build();
        return subscriptionMapper.toResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public SubscriptionResponse updateSubscription(String email, UUID id, SubscriptionRequest request) {
        User user = getUser(email);
        Subscription sub = subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        sub.setName(request.getName().trim());
        sub.setAmount(request.getAmount());
        sub.setRenewalDate(request.getRenewalDate());
        sub.setActive(request.isActive());

        return subscriptionMapper.toResponse(subscriptionRepository.save(sub));
    }

    @Transactional
    public void deleteSubscription(String email, UUID id) {
        User user = getUser(email);
        Subscription sub = subscriptionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));
        subscriptionRepository.delete(sub);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
