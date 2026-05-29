package com.iponchallenge.mapper;

import com.iponchallenge.dto.SplitBillResponse;
import com.iponchallenge.entity.SplitBill;
import org.springframework.stereotype.Component;

@Component
public class SplitBillMapper {

    public SplitBillResponse toResponse(SplitBill splitBill) {
        String message = String.format("Each person owes ₱%s for \"%s\".",
                splitBill.getAmountPerMember().toPlainString(),
                splitBill.getTitle());

        return SplitBillResponse.builder()
                .id(splitBill.getId())
                .title(splitBill.getTitle())
                .totalAmount(splitBill.getTotalAmount())
                .memberCount(splitBill.getMemberCount())
                .amountPerMember(splitBill.getAmountPerMember())
                .shareMessage(message)
                .createdAt(splitBill.getCreatedAt())
                .build();
    }
}
