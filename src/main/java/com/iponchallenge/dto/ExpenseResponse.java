package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.iponchallenge.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseResponse {

    private UUID id;
    private UUID categoryId;
    private String categoryName;
    private BigDecimal amount;
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expenseDate;

    private TransactionType transactionType;
    private LocalDateTime createdAt;
}
