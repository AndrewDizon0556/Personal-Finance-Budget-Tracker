package com.budgettracker.dto;

import com.budgettracker.entity.AllowanceSchedule;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class RegisterRequest {
    @NotBlank(message = "fullName is required")
    private String fullName;

    @NotBlank(message = "school is required")
    private String school;

    @Email(message = "email must be valid")
    @NotBlank(message = "email is required")
    private String email;

    @NotBlank(message = "password is required")
    private String password;

    @NotNull(message = "monthlyAllowance is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "monthlyAllowance must be > 0")
    private BigDecimal monthlyAllowance;

    @NotNull(message = "allowanceSchedule is required")
    private AllowanceSchedule allowanceSchedule;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getSchool() {
        return school;
    }

    public void setSchool(String school) {
        this.school = school;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public BigDecimal getMonthlyAllowance() {
        return monthlyAllowance;
    }

    public void setMonthlyAllowance(BigDecimal monthlyAllowance) {
        this.monthlyAllowance = monthlyAllowance;
    }

    public AllowanceSchedule getAllowanceSchedule() {
        return allowanceSchedule;
    }

    public void setAllowanceSchedule(AllowanceSchedule allowanceSchedule) {
        this.allowanceSchedule = allowanceSchedule;
    }
}
