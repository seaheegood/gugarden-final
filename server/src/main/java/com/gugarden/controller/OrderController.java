package com.gugarden.controller;

import com.gugarden.dto.request.OrderRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "주문", description = "주문 생성/조회/취소 API (로그인 필요)")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "주문 목록 조회")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getOrders(principal.getId()));
    }

    @Operation(summary = "주문 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(
            @Parameter(description = "주문 ID") @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getOrderDetail(id, principal.getId()));
    }

    @Operation(summary = "주문 생성", description = "장바구니 상품으로 주문을 생성합니다. 5만원 이상 무료배송.")
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(principal.getId(), request));
    }

    @Operation(summary = "주문 취소", description = "pending 또는 paid 상태의 주문만 취소 가능합니다.")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(
            @Parameter(description = "주문 ID") @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.cancelOrder(id, principal.getId()));
    }
}
