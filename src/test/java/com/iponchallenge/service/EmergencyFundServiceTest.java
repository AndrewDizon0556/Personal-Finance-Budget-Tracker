package com.iponchallenge.service;

import com.iponchallenge.dto.EmergencyFundResponse;
import com.iponchallenge.entity.EmergencyFund;
import com.iponchallenge.entity.User;
import com.iponchallenge.mapper.EmergencyFundMapper;
import com.iponchallenge.repository.EmergencyFundRepository;
import com.iponchallenge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmergencyFundServiceTest {

    private static final String EMAIL = "student@nu.edu";

    @Mock private EmergencyFundRepository fundRepository;
    @Mock private UserRepository userRepository;
    @Spy  private EmergencyFundMapper fundMapper;

    @InjectMocks private EmergencyFundService fundService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().email(EMAIL).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
    }

    @Test
    void progressPercentage_isComputedCorrectly() {
        EmergencyFund fund = buildFund(new BigDecimal("3000"), new BigDecimal("1200"));
        EmergencyFundResponse response = fundMapper.toResponse(fund);
        assertThat(response.getProgressPercentage()).isEqualTo(40.0);
    }

    @Test
    void funded_isTrueWhenCurrentMeetsTarget() {
        EmergencyFund fund = buildFund(new BigDecimal("1000"), new BigDecimal("1000"));
        EmergencyFundResponse response = fundMapper.toResponse(fund);
        assertThat(response.isFunded()).isTrue();
    }

    @Test
    void funded_isFalseWhenBelowTarget() {
        EmergencyFund fund = buildFund(new BigDecimal("1000"), new BigDecimal("500"));
        EmergencyFundResponse response = fundMapper.toResponse(fund);
        assertThat(response.isFunded()).isFalse();
        assertThat(response.getRemaining()).isEqualByComparingTo("500");
    }

    @Test
    void contribute_addsAmountToCurrentAmount() {
        EmergencyFund fund = buildFund(new BigDecimal("3000"), new BigDecimal("500"));
        fund.setId(UUID.randomUUID());
        when(fundRepository.findByIdAndUser(fund.getId(), user)).thenReturn(Optional.of(fund));
        when(fundRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmergencyFundResponse response = fundService.contribute(EMAIL, fund.getId(), new BigDecimal("200"));

        assertThat(response.getCurrentAmount()).isEqualByComparingTo("700");
    }

    @Test
    void progressPercentage_cappedAt100_whenOverfunded() {
        EmergencyFund fund = buildFund(new BigDecimal("1000"), new BigDecimal("1200"));
        EmergencyFundResponse response = fundMapper.toResponse(fund);
        assertThat(response.getProgressPercentage()).isEqualTo(100.0);
    }

    private EmergencyFund buildFund(BigDecimal target, BigDecimal current) {
        return EmergencyFund.builder()
                .id(UUID.randomUUID())
                .user(user)
                .name("Medical Emergency")
                .category("MEDICAL")
                .targetAmount(target)
                .currentAmount(current)
                .build();
    }
}
