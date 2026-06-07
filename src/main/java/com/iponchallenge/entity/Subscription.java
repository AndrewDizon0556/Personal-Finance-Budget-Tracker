package com.iponchallenge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "renewal_date", nullable = false)
    private LocalDate renewalDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Optional category for the expense created when this subscription is paid. */
    @Column(name = "category")
    private String category;

    // DB default keeps Hibernate auto-update safe on a populated table.
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, columnDefinition = "varchar(20) default 'PENDING'")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    /** The expense transaction created when marked paid — used to prevent
     *  duplicate deductions and to reverse the deduction if set back to pending. */
    @Column(name = "paid_expense_id")
    private UUID paidExpenseId;
}
