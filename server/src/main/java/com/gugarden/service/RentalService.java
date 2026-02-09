package com.gugarden.service;

import com.gugarden.dto.request.RentalInquiryRequest;
import com.gugarden.entity.RentalInquiry;
import com.gugarden.exception.BadRequestException;
import com.gugarden.repository.RentalInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalInquiryRepository rentalInquiryRepository;

    @Transactional
    public Map<String, Object> submitInquiry(RentalInquiryRequest request) {
        if (request.getName() == null || request.getEmail() == null || request.getPhone() == null) {
            throw new BadRequestException("필수 정보를 입력해주세요.");
        }

        RentalInquiry inquiry = RentalInquiry.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .company(request.getCompany())
                .location(request.getLocation())
                .spaceSize(request.getSpaceSize())
                .message(request.getMessage())
                .build();

        rentalInquiryRepository.save(inquiry);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "렌탈 문의가 접수되었습니다.");
        result.put("inquiryId", inquiry.getId());
        return result;
    }
}
