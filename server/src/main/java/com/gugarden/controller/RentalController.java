package com.gugarden.controller;

import com.gugarden.dto.request.RentalInquiryRequest;
import com.gugarden.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/rental")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping("/inquiry")
    public ResponseEntity<Map<String, Object>> submitInquiry(@Valid @RequestBody RentalInquiryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.submitInquiry(request));
    }
}
