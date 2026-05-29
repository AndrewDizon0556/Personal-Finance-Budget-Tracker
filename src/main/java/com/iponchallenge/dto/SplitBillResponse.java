package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SplitBillResponse {

    private UUID id;
    private String title;
    private BigDecimal totalAmount;
    private int memberCount;
    private BigDecimal amountPerMember;
    private String shareMessage;
    private LocalDateTime createdAt;
}
