package com.iponchallenge.dto;

import com.iponchallenge.entity.AllowanceSchedule;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name is too long")
    private String fullName;

    @Size(max = 120, message = "School name is too long")
    private String schoolName;

    @PositiveOrZero(message = "Allowance must be zero or more")
    @DecimalMax(value = "100000000", message = "Allowance is unrealistically large")
    private BigDecimal monthlyAllowance;

    private AllowanceSchedule allowanceSchedule;
}
