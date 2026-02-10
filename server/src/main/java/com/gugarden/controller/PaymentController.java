package com.gugarden.controller;

import com.gugarden.dto.request.PaymentRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // NaverPay
    @PostMapping("/prepare")
    public ResponseEntity<Map<String, Object>> prepareNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.prepareNaverPay(request.getOrderId(), principal.getId()));
    }

    @PostMapping("/approve")
    public ResponseEntity<Map<String, Object>> approveNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.approveNaverPay(request.getOrderId(), request.getPaymentId(), principal.getId()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancelNaverPay(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.cancelNaverPay(request.getOrderId(), request.getReason(), principal.getId()));
    }

    @GetMapping("/status/{orderId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(orderId, principal.getId()));
    }

    // TossPay
    @PostMapping("/toss/prepare")
    public ResponseEntity<Map<String, Object>> prepareToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.prepareToss(request.getOrderId(), principal.getId(), principal.getEmail()));
    }

    @PostMapping("/toss/confirm")
    public ResponseEntity<Map<String, Object>> confirmToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.confirmToss(request.getOrderId(), request.getPaymentKey(), request.getAmount(), principal.getId()));
    }

    @PostMapping("/toss/cancel")
    public ResponseEntity<Map<String, Object>> cancelToss(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.cancelToss(request.getOrderId(), request.getCancelReason(), principal.getId()));
    }
}
