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

        SplitBill splitBill = SplitBill.builder()
                .user(user)
                .title(request.getTitle().trim())
                .totalAmount(request.getTotalAmount())
                .memberCount(request.getMemberCount())
                .amountPerMember(perMember(request.getTotalAmount(), request.getMemberCount()))
                .build();

        return splitBillMapper.toResponse(splitBillRepository.save(splitBill));
    }

    @Transactional
    public SplitBillResponse updateSplitBill(String email, UUID id, SplitBillRequest request) {
        User user = getUser(email);
        SplitBill splitBill = splitBillRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Split bill not found"));

        splitBill.setTitle(request.getTitle().trim());
        splitBill.setTotalAmount(request.getTotalAmount());
        splitBill.setMemberCount(request.getMemberCount());
        splitBill.setAmountPerMember(perMember(request.getTotalAmount(), request.getMemberCount()));

        return splitBillMapper.toResponse(splitBillRepository.save(splitBill));
    }

    /** Even per-member share, rounded to 2 dp. memberCount is validated ≥ 2 upstream. */
    private BigDecimal perMember(BigDecimal total, int memberCount) {
        return total.divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);
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
