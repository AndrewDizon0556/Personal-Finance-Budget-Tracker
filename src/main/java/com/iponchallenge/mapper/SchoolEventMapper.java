package com.iponchallenge.mapper;

import com.iponchallenge.dto.SchoolEventResponse;
import com.iponchallenge.entity.SchoolEvent;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class SchoolEventMapper {

    public SchoolEventResponse toResponse(SchoolEvent event) {
        LocalDate today = LocalDate.now();
        long daysUntil = ChronoUnit.DAYS.between(today, event.getDate());
        boolean isUpcoming = daysUntil >= 0 && daysUntil <= 14;

        String suggestion = null;
        if (isUpcoming && event.getEstimatedCost() != null
                && event.getEstimatedCost().compareTo(BigDecimal.ZERO) > 0) {
            int daysLeft = Math.max((int) daysUntil, 1);
            BigDecimal perDay = event.getEstimatedCost()
                    .divide(BigDecimal.valueOf(daysLeft), 0, java.math.RoundingMode.CEILING);
            suggestion = "Save ₱" + perDay.toPlainString() + "/day to cover ₱"
                    + event.getEstimatedCost().toPlainString() + " for this event.";
        }

        return SchoolEventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .date(event.getDate())
                .category(event.getCategory())
                .estimatedCost(event.getEstimatedCost())
                .notes(event.getNotes())
                .daysUntil((int) daysUntil)
                .isUpcoming(isUpcoming)
                .budgetSuggestion(suggestion)
                .createdAt(event.getCreatedAt())
                .build();
    }
}
