package com.iponchallenge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsightDto {
    /** positive | warning | info | celebrate */
    private String tone;
    private String text;
}
