package com.gugarden.controller;

import com.gugarden.dto.request.*;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.client-url}")
    private String clientUrl;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getMe(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal.getId(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(authService.changePassword(principal.getId(), request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.deleteAccount(principal.getId()));
    }

    // 소셜 로그인은 Spring Security OAuth2 Client로 처리하거나
    // 프론트에서 직접 OAuth 처리 후 토큰을 백엔드로 전달하는 방식으로 구현
    // 여기서는 간단히 리다이렉트 방식으로 구현

    @GetMapping("/naver")
    public ResponseEntity<Void> naverLogin() {
        // Naver OAuth 시작 - Spring Security OAuth2 Client가 처리
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "/oauth2/authorization/naver")
                .build();
    }

    @GetMapping("/naver/callback")
    public ResponseEntity<Void> naverCallback(@RequestParam String code, @RequestParam String state) {
        // OAuth callback 처리는 별도 구현 필요
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", clientUrl + "/auth/callback")
                .build();
    }

    @GetMapping("/kakao")
    public ResponseEntity<Void> kakaoLogin() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "/oauth2/authorization/kakao")
                .build();
    }

    @GetMapping("/kakao/callback")
    public ResponseEntity<Void> kakaoCallback(@RequestParam String code) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", clientUrl + "/auth/callback")
                .build();
    }
}
