package com.gugarden.controller;

import com.gugarden.dto.request.*;
import com.gugarden.entity.User;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.client-url}")
    private String clientUrl;

    @Value("${app.naver.client-id}")
    private String naverClientId;

    @Value("${app.naver.client-secret}")
    private String naverClientSecret;

    @Value("${app.naver.callback-url}")
    private String naverCallbackUrl;

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

    // --- 네이버 OAuth ---

    @GetMapping("/naver")
    public ResponseEntity<Void> naverLogin() {
        String state = UUID.randomUUID().toString();
        String authUrl = "https://nid.naver.com/oauth2.0/authorize"
                + "?client_id=" + naverClientId
                + "&redirect_uri=" + URLEncoder.encode(naverCallbackUrl, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&state=" + state;

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", authUrl)
                .build();
    }

    @GetMapping("/naver/callback")
    public ResponseEntity<Void> naverCallback(@RequestParam String code, @RequestParam String state) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // 1. 액세스 토큰 요청
            String tokenUrl = "https://nid.naver.com/oauth2.0/token"
                    + "?grant_type=authorization_code"
                    + "&client_id=" + naverClientId
                    + "&client_secret=" + naverClientSecret
                    + "&code=" + code
                    + "&state=" + state;

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restTemplate.getForObject(tokenUrl, Map.class);
            String accessToken = (String) tokenResponse.get("access_token");

            if (accessToken == null) {
                log.error("네이버 토큰 발급 실패: {}", tokenResponse);
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header("Location", clientUrl + "/auth/callback?error=token_failed")
                        .build();
            }

            // 2. 사용자 프로필 조회
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> profileResponse = restTemplate.exchange(
                    "https://openapi.naver.com/v1/nid/me",
                    HttpMethod.GET, entity, Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) profileResponse.getBody().get("response");

            String providerId = (String) profile.get("id");
            String email = (String) profile.get("email");
            String name = (String) profile.get("name");
            String phone = (String) profile.get("mobile");
            String profileImage = (String) profile.get("profile_image");

            // 3. 사용자 생성/조회 + JWT 발급
            String jwt = authService.handleSocialLogin(
                    User.Provider.naver, providerId, email, name, phone, profileImage);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", clientUrl + "/auth/callback?token=" + jwt)
                    .build();

        } catch (Exception e) {
            log.error("네이버 로그인 처리 실패", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", clientUrl + "/auth/callback?error=login_failed")
                    .build();
        }
    }

}
