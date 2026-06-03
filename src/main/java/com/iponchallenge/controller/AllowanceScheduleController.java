package com.iponchallenge.controller;

import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.UserRepository;
import com.iponchallenge.service.AllowanceSchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/allowance/schedule")
@RequiredArgsConstructor
public class AllowanceScheduleController {

    private final UserRepository userRepository;
    private final AllowanceSchedulerService schedulerService;

    /** Returns info about the user's next automatic allowance payout. */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getScheduleInfo(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getAllowanceSchedule() == null || user.getMonthlyAllowance() == null) {
            return ResponseEntity.ok(Map.of(
                "enabled", false,
                "message", "Set your allowance and schedule in Profile to enable auto-allowance."
            ));
        }

        LocalDate nextPayout = schedulerService.getNextPayoutDate(user);
        long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), nextPayout);

        return ResponseEntity.ok(Map.of(
            "enabled",          true,
            "amount",           user.getMonthlyAllowance(),
            "schedule",         user.getAllowanceSchedule().name(),
            "lastPaidAt",       user.getLastAllowancePaidAt() != null ? user.getLastAllowancePaidAt().toString() : null,
            "nextPayoutDate",   nextPayout.toString(),
            "daysUntilPayout",  daysUntil
        ));
    }
}
