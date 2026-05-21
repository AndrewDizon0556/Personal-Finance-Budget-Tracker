package com.budgettracker.service;

import com.budgettracker.dto.SplitBillResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class SplitBillService {
    public SplitBillResponse split(BigDecimal totalAmount, int members) {
        if (members < 1) {
            throw new IllegalArgumentException("members must be >= 1");
        }
        BigDecimal eachPays = totalAmount.divide(BigDecimal.valueOf(members), 2, RoundingMode.HALF_UP);
        return new SplitBillResponse(eachPays);
    }
}
