package com.iponchallenge.dto;

import com.iponchallenge.entity.AllowanceSchedule;
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

    private String fullName;
    private String schoolName;
    private BigDecimal monthlyAllowance;
    private AllowanceSchedule allowanceSchedule;
}
