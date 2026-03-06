package com.gugarden.controller;

import com.gugarden.dto.request.CartRequest;
import com.gugarden.dto.request.CartUpdateRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "장바구니", description = "장바구니 관리 API (로그인 필요)")
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @Operation(summary = "장바구니 조회")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getId()));
    }

    @Operation(summary = "장바구니 추가", description = "이미 담긴 상품이면 수량을 증가시킵니다.")
    @PostMapping
    public ResponseEntity<Map<String, String>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(principal.getId(), request.getProductId(), request.getQuantity()));
    }

    @Operation(summary = "장바구니 수량 변경")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateQuantity(
            @Parameter(description = "장바구니 항목 ID") @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(id, principal.getId(), request.getQuantity()));
    }

    @Operation(summary = "장바구니 항목 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeItem(
            @Parameter(description = "장바구니 항목 ID") @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.removeItem(id, principal.getId()));
    }

    @Operation(summary = "장바구니 전체 비우기")
    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.clearCart(principal.getId()));
    }
}
