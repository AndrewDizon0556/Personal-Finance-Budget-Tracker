package com.iponchallenge.mapper;

import com.iponchallenge.dto.SemesterBudgetResponse;
import com.iponchallenge.entity.SemesterBudget;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class SemesterBudgetMapper {

    public SemesterBudgetResponse toResponse(
            SemesterBudget semester,
            BigDecimal totalSpent
    ) {
        LocalDate today = LocalDate.now();
        LocalDate start = semester.getStartDate();
        LocalDate end = semester.getEndDate();

        long totalDays = ChronoUnit.DAYS.between(start, end);
        int totalWeeks = (int) Math.max(1, (long) Math.ceil(totalDays / 7.0));

        long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(start, today.isBefore(start) ? start : today));
        int weeksElapsed = (int) Math.min(totalWeeks, (long) Math.ceil(daysElapsed / 7.0));
        int weeksRemaining = Math.max(1, totalWeeks - weeksElapsed);

        BigDecimal remaining = semester.getTotalBudget().subtract(totalSpent);
        BigDecimal weeklyBudget = remaining.divide(BigDecimal.valueOf(weeksRemaining), 2, RoundingMode.HALF_UP);

        double progressPct = semester.getTotalBudget().compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(semester.getTotalBudget(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0.0;

        boolean isCompleted = today.isAfter(end);
        String status;
        String statusMessage;
        if (isCompleted) {
            status = "COMPLETED";
            statusMessage = remaining.compareTo(BigDecimal.ZERO) >= 0
                    ? "Semester ended. You saved ₱" + remaining.toPlainString() + "!"
                    : "Semester ended. You exceeded your budget.";
        } else if (progressPct >= 100) {
            status = "CRITICAL";
            statusMessage = "You've used your entire semester budget. Spend carefully!";
        } else if (progressPct >= 80) {
            status = "WARNING";
            statusMessage = "You've spent " + String.format("%.0f", progressPct) + "% of your budget. Watch your spending.";
        } else {
            status = "ON_TRACK";
            statusMessage = "You are on track. ₱" + weeklyBudget.toPlainString() + "/week recommended.";
        }

        return SemesterBudgetResponse.builder()
                .id(semester.getId())
                .semesterName(semester.getSemesterName())
                .startDate(start)
                .endDate(end)
                .totalBudget(semester.getTotalBudget())
                .targetSavings(semester.getTargetSavings())
                .allowanceSchedule(semester.getAllowanceSchedule())
                .totalSpent(totalSpent)
                .remaining(remaining)
                .weeklyBudget(weeklyBudget)
                .totalWeeks(totalWeeks)
                .weeksElapsed(weeksElapsed)
                .weeksRemaining(weeksRemaining)
                .progressPercentage(Math.min(progressPct, 100.0))
                .status(status)
                .statusMessage(statusMessage)
                .createdAt(semester.getCreatedAt())
                .build();
    }
}
