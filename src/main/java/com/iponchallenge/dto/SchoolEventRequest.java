package com.iponchallenge.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SchoolEventRequest {

    @NotBlank(message = "Event title is required")
    private String title;

    @NotNull(message = "Event date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotBlank(message = "Category is required")
    private String category; // EXAM | PROJECT | TUITION | EVENT | DEADLINE

    @DecimalMin(value = "0.00", message = "Estimated cost cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Amount is too large")
    private BigDecimal estimatedCost;

    private String notes;
}
