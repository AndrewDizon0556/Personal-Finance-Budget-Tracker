package com.iponchallenge.dto;

import com.iponchallenge.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Body for changing a subscription's payment status (PAID / PENDING). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;
}
