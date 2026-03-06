package com.gugarden.controller;

import com.gugarden.dto.request.PaymentRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "결제", description = "네이버페이/토스페이먼츠 결제 API (로그인 필요)")
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "네이버페이 결제 예약")
    @PostMapping("/prepare")
    public ResponseEntity<Map<String, Object>> prepareNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.prepareNaverPay(request.getOrderId(), principal.getId()));
    }

    @Operation(summary = "네이버페이 결제 승인")
    @PostMapping("/approve")
    public ResponseEntity<Map<String, Object>> approveNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.approveNaverPay(request.getOrderId(), request.getPaymentId(), principal.getId()));
    }

    @Operation(summary = "네이버페이 결제 취소")
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.cancelNaverPay(request.getOrderId(), request.getReason(), principal.getId()));
    }

    @Operation(summary = "결제 상태 조회")
    @GetMapping("/status/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(orderId, principal.getId()));
    }

    @Operation(summary = "토스페이먼츠 결제 준비")
    @PostMapping("/toss/prepare")
    public ResponseEntity<Map<String, Object>> prepareToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.prepareToss(request.getOrderId(), principal.getId(), principal.getEmail()));
    }

    @Operation(summary = "토스페이먼츠 결제 승인")
    @PostMapping("/toss/confirm")
    public ResponseEntity<Map<String, Object>> confirmToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmToss(request.getOrderId(), request.getPaymentKey(), request.getAmount(), principal.getId()));
    }

    @Operation(summary = "토스페이먼츠 결제 취소")
    @PostMapping("/toss/cancel")
    public ResponseEntity<Map<String, Object>> cancelToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.cancelToss(request.getOrderId(), request.getCancelReason(), principal.getId()));
    }
}
