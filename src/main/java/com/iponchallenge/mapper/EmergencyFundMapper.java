package com.iponchallenge.mapper;

import com.iponchallenge.dto.EmergencyFundResponse;
import com.iponchallenge.entity.EmergencyFund;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class EmergencyFundMapper {

    public EmergencyFundResponse toResponse(EmergencyFund fund) {
        double pct = fund.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                ? fund.getCurrentAmount()
                        .divide(fund.getTargetAmount(), 4, RoundingMode.HALF_UP)
                        .doubleValue() * 100
                : 0.0;

        BigDecimal remaining = fund.getTargetAmount().subtract(fund.getCurrentAmount());

        return EmergencyFundResponse.builder()
                .id(fund.getId())
                .name(fund.getName())
                .category(fund.getCategory())
                .targetAmount(fund.getTargetAmount())
                .currentAmount(fund.getCurrentAmount())
                .progressPercentage(Math.min(pct, 100.0))
                .remaining(remaining.max(BigDecimal.ZERO))
                .funded(fund.getCurrentAmount().compareTo(fund.getTargetAmount()) >= 0)
                .createdAt(fund.getCreatedAt())
                .updatedAt(fund.getUpdatedAt())
                .build();
    }
}
