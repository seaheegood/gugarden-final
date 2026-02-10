package com.gugarden.controller;

import com.gugarden.dto.request.*;
import com.gugarden.entity.User;
import com.gugarden.security.AuthCodeStore;
import com.gugarden.security.CookieUtil;
import com.gugarden.security.JwtTokenProvider;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final CookieUtil cookieUtil;
    private final AuthCodeStore authCodeStore;

    @Value("${app.client-url}")
    private String clientUrl;

    @Value("${app.naver.client-id}")
    private String naverClientId;

    @Value("${app.naver.client-secret}")
    private String naverClientSecret;

    @Value("${app.naver.callback-url}")
    private String naverCallbackUrl;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> result = authService.register(request);

        String token = (String) result.get("token");
        ResponseCookie cookie = cookieUtil.createAuthCookie(token, 604800);
        result.remove("token");

        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> result = authService.login(request);

        String token = (String) result.get("token");
        ResponseCookie cookie = cookieUtil.createAuthCookie(token, 604800);
        result.remove("token");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(authService.getMe(principal.getId()));
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal.getId(), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        Map<String, String> result = authService.changePassword(principal.getId(), request);

        String newToken = result.get("token");
        ResponseCookie cookie = cookieUtil.createAuthCookie(newToken, 604800);
        result.remove("token");

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, String> result = authService.deleteAccount(principal.getId());
        ResponseCookie clearCookie = cookieUtil.createClearCookie();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        ResponseCookie clearCookie = cookieUtil.createClearCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(Map.of("message", "로그아웃되었습니다."));
    }

    @PostMapping("/exchange-code")
    public ResponseEntity<Map<String, Object>> exchangeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", (Object) "코드가 필요합니다."));
        }

        String jwt = authCodeStore.exchangeCode(code);
        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", (Object) "유효하지 않거나 만료된 코드입니다."));
        }

        ResponseCookie cookie = cookieUtil.createAuthCookie(jwt, 604800);

        Integer userId = jwtTokenProvider.getUserId(jwt);
        Map<String, Object> meResult = authService.getMe(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "로그인 성공");
        result.put("user", meResult.get("user"));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result);
    }

    // --- 네이버 OAuth ---

    @GetMapping("/naver")
    public ResponseEntity<Void> naverLogin() {
        String state = jwtTokenProvider.generateStateToken();
        String authUrl = "https://nid.naver.com/oauth2.0/authorize"
                + "?client_id=" + naverClientId
                + "&redirect_uri=" + URLEncoder.encode(naverCallbackUrl, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", authUrl)
                .build();
    }

    @GetMapping("/naver/callback")
    public ResponseEntity<Void> naverCallback(@RequestParam String code, @RequestParam String state) {
        // OAuth state 검증 (CSRF 방지)
        if (!jwtTokenProvider.validateStateToken(state)) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", clientUrl + "/auth/callback?error=invalid_state")
                    .build();
        }

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

            // JWT를 일회용 코드로 교환 (URL에 JWT 노출 방지)
            String authCode = authCodeStore.storeCode(jwt);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", clientUrl + "/auth/callback?code=" + authCode)
                    .build();

        } catch (Exception e) {
            log.error("네이버 로그인 처리 실패", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", clientUrl + "/auth/callback?error=login_failed")
                    .build();
        }
    }

}
