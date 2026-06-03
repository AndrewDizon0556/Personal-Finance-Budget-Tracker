package com.iponchallenge.service;

import com.iponchallenge.dto.SemesterBudgetRequest;
import com.iponchallenge.dto.SemesterBudgetResponse;
import com.iponchallenge.dto.WeeklyBreakdownResponse;
import com.iponchallenge.entity.SemesterBudget;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SemesterBudgetMapper;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.SemesterBudgetRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SemesterBudgetService {

    private final SemesterBudgetRepository semesterBudgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final SemesterBudgetMapper semesterBudgetMapper;

    public List<SemesterBudgetResponse> getSemesterBudgets(String email) {
        User user = getUser(email);
        return semesterBudgetRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(s -> semesterBudgetMapper.toResponse(s, computeTotalSpent(user, s)))
                .collect(Collectors.toList());
    }

    public SemesterBudgetResponse getSemesterBudget(String email, UUID id) {
        User user = getUser(email);
        SemesterBudget semester = findOwned(user, id);
        return semesterBudgetMapper.toResponse(semester, computeTotalSpent(user, semester));
    }

    @Transactional
    public SemesterBudgetResponse createSemesterBudget(String email, SemesterBudgetRequest request) {
        User user = getUser(email);
        validateDates(request.getStartDate(), request.getEndDate());

        SemesterBudget semester = SemesterBudget.builder()
                .user(user)
                .semesterName(request.getSemesterName().trim())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudget(request.getTotalBudget())
                .targetSavings(request.getTargetSavings())
                .allowanceSchedule(request.getAllowanceSchedule())
                .build();

        SemesterBudget saved = semesterBudgetRepository.save(semester);
        return semesterBudgetMapper.toResponse(saved, BigDecimal.ZERO);
    }

    @Transactional
    public SemesterBudgetResponse updateSemesterBudget(String email, UUID id, SemesterBudgetRequest request) {
        User user = getUser(email);
        SemesterBudget semester = findOwned(user, id);
        validateDates(request.getStartDate(), request.getEndDate());

        semester.setSemesterName(request.getSemesterName().trim());
        semester.setStartDate(request.getStartDate());
        semester.setEndDate(request.getEndDate());
        semester.setTotalBudget(request.getTotalBudget());
        semester.setTargetSavings(request.getTargetSavings());
        semester.setAllowanceSchedule(request.getAllowanceSchedule());

        SemesterBudget saved = semesterBudgetRepository.save(semester);
        return semesterBudgetMapper.toResponse(saved, computeTotalSpent(user, saved));
    }

    @Transactional
    public void deleteSemesterBudget(String email, UUID id) {
        User user = getUser(email);
        SemesterBudget semester = findOwned(user, id);
        semesterBudgetRepository.delete(semester);
    }

    /** Divides the semester into 7-day windows and computes spending per window. */
    public List<WeeklyBreakdownResponse> getWeeklyBreakdown(String email, UUID id) {
        User user = getUser(email);
        SemesterBudget semester = findOwned(user, id);

        LocalDate cursor = semester.getStartDate();
        LocalDate semesterEnd = semester.getEndDate();
        LocalDate today = LocalDate.now();

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(cursor, semesterEnd);
        int totalWeeks = (int) Math.max(1, (long) Math.ceil(totalDays / 7.0));
        BigDecimal weeklyAllocation = semester.getTotalBudget()
                .divide(BigDecimal.valueOf(totalWeeks), 2, RoundingMode.HALF_UP);

        List<WeeklyBreakdownResponse> weeks = new ArrayList<>();
        int weekNum = 1;

        while (!cursor.isAfter(semesterEnd)) {
            LocalDate weekEnd = cursor.plusDays(6).isAfter(semesterEnd)
                    ? semesterEnd
                    : cursor.plusDays(6);

            boolean isCurrent = !today.isBefore(cursor) && !today.isAfter(weekEnd);
            boolean isUpcoming = cursor.isAfter(today);

            BigDecimal spent = isUpcoming
                    ? BigDecimal.ZERO
                    : expenseRepository.sumByUserAndDateBetweenAndType(user, cursor, weekEnd, TransactionType.EXPENSE);

            BigDecimal remaining = weeklyAllocation.subtract(spent);
            double usagePct = weeklyAllocation.compareTo(BigDecimal.ZERO) > 0
                    ? spent.divide(weeklyAllocation, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            String status;
            if (isUpcoming)            status = "UPCOMING";
            else if (usagePct >= 100)  status = "OVERSPENT";
            else if (usagePct >= 80)   status = "WARNING";
            else                       status = "SAFE";

            weeks.add(WeeklyBreakdownResponse.builder()
                    .weekNumber(weekNum)
                    .weekStart(cursor)
                    .weekEnd(weekEnd)
                    .allocatedAmount(weeklyAllocation)
                    .spentAmount(spent)
                    .remainingAmount(remaining)
                    .usagePercentage(Math.min(usagePct, 100.0))
                    .status(status)
                    .isCurrent(isCurrent)
                    .build());

            cursor = weekEnd.plusDays(1);
            weekNum++;
        }

        return weeks;
    }

    private BigDecimal computeTotalSpent(User user, SemesterBudget semester) {
        return expenseRepository.sumByUserAndDateBetweenAndType(
                user, semester.getStartDate(), semester.getEndDate(), TransactionType.EXPENSE);
    }

    private SemesterBudget findOwned(User user, UUID id) {
        return semesterBudgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Semester budget not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (!end.isAfter(start)) {
            throw new BadRequestException("End date must be after start date");
        }
    }
}
