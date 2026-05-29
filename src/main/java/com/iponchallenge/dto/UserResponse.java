package com.iponchallenge.dto;

import com.iponchallenge.entity.AllowanceSchedule;
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
public class UserResponse {

    private UUID id;
    private String fullName;
    private String schoolName;
    private String email;
    private BigDecimal monthlyAllowance;
    private AllowanceSchedule allowanceSchedule;
    private LocalDateTime createdAt;
}
