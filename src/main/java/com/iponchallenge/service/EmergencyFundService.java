package com.iponchallenge.service;

import com.iponchallenge.dto.EmergencyFundRequest;
import com.iponchallenge.dto.EmergencyFundResponse;
import com.iponchallenge.entity.EmergencyFund;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.exception.ResourceNotFoundException;
import com.iponchallenge.mapper.EmergencyFundMapper;
import com.iponchallenge.repository.EmergencyFundRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmergencyFundService {

    private final EmergencyFundRepository fundRepository;
    private final UserRepository userRepository;
    private final EmergencyFundMapper fundMapper;

    public List<EmergencyFundResponse> getFunds(String email) {
        User user = getUser(email);
        return fundRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(fundMapper::toResponse).collect(Collectors.toList());
    }

    public EmergencyFundResponse getFund(String email, UUID id) {
        User user = getUser(email);
        EmergencyFund fund = findOwned(user, id);
        return fundMapper.toResponse(fund);
    }

    @Transactional
    public EmergencyFundResponse createFund(String email, EmergencyFundRequest request) {
        User user = getUser(email);
        EmergencyFund fund = EmergencyFund.builder()
                .user(user)
                .name(request.getName().trim())
                .category(request.getCategory())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount() != null
                        ? request.getCurrentAmount() : BigDecimal.ZERO)
                .build();
        return fundMapper.toResponse(fundRepository.save(fund));
    }

    @Transactional
    public EmergencyFundResponse updateFund(String email, UUID id, EmergencyFundRequest request) {
        User user = getUser(email);
        EmergencyFund fund = findOwned(user, id);

        fund.setName(request.getName().trim());
        fund.setCategory(request.getCategory());
        fund.setTargetAmount(request.getTargetAmount());
        if (request.getCurrentAmount() != null) {
            fund.setCurrentAmount(request.getCurrentAmount());
        }
        return fundMapper.toResponse(fundRepository.save(fund));
    }

    @Transactional
    public EmergencyFundResponse contribute(String email, UUID id, BigDecimal amount) {
        User user = getUser(email);
        EmergencyFund fund = findOwned(user, id);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Contribution must be greater than zero");
        }
        fund.setCurrentAmount(fund.getCurrentAmount().add(amount));
        return fundMapper.toResponse(fundRepository.save(fund));
    }

    @Transactional
    public void deleteFund(String email, UUID id) {
        User user = getUser(email);
        EmergencyFund fund = findOwned(user, id);
        fundRepository.delete(fund);
    }

    private EmergencyFund findOwned(User user, UUID id) {
        return fundRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency fund not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
