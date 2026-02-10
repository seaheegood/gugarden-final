package com.gugarden.controller;

import com.gugarden.dto.request.CartRequest;
import com.gugarden.dto.request.CartUpdateRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getId()));
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(principal.getId(), request.getProductId(), request.getQuantity()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateQuantity(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(id, principal.getId(), request.getQuantity()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> removeItem(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.removeItem(id, principal.getId()));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(cartService.clearCart(principal.getId()));
    }
}
