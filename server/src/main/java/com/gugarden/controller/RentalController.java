package com.gugarden.controller;

import com.gugarden.dto.request.RentalInquiryRequest;
import com.gugarden.service.RentalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "렌탈", description = "렌탈 문의 API (인증 불필요)")
@RestController
@RequestMapping("/api/rental")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @Operation(summary = "렌탈 문의 제출", description = "누구나 문의를 제출할 수 있습니다.")
    @PostMapping("/inquiry")
    public ResponseEntity<Map<String, Object>> submitInquiry(@Valid @RequestBody RentalInquiryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.submitInquiry(request));
    }
}
