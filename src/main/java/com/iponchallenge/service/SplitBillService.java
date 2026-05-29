package com.iponchallenge.service;

import com.iponchallenge.dto.SplitBillRequest;
import com.iponchallenge.dto.SplitBillResponse;
import com.iponchallenge.entity.SplitBill;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.SplitBillMapper;
import com.iponchallenge.repository.SplitBillRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SplitBillService {

    private final SplitBillRepository splitBillRepository;
    private final UserRepository userRepository;
    private final SplitBillMapper splitBillMapper;

    public List<SplitBillResponse> getSplitBills(String email) {
        User user = getUser(email);
        return splitBillRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(splitBillMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public SplitBillResponse createSplitBill(String email, SplitBillRequest request) {
        User user = getUser(email);
        BigDecimal amountPerMember = request.getTotalAmount()
                .divide(BigDecimal.valueOf(request.getMemberCount()), 2, RoundingMode.HALF_UP);

        SplitBill splitBill = SplitBill.builder()
                .user(user)
                .title(request.getTitle().trim())
                .totalAmount(request.getTotalAmount())
                .memberCount(request.getMemberCount())
                .amountPerMember(amountPerMember)
                .build();

        return splitBillMapper.toResponse(splitBillRepository.save(splitBill));
    }

    @Transactional
    public void deleteSplitBill(String email, UUID id) {
        User user = getUser(email);
        SplitBill splitBill = splitBillRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Split bill not found"));
        splitBillRepository.delete(splitBill);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
