package com.iponchallenge.dto;

import com.iponchallenge.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    /** Optional; defaults to EXPENSE when omitted. */
    private CategoryType type;
}
