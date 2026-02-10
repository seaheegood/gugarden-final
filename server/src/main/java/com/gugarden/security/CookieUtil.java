package com.gugarden.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.domain:}")
    private String domain;

    public ResponseCookie createAuthCookie(String token, long maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("auth_token", token)
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax");

        if (domain != null && !domain.isEmpty()) {
            builder.domain(domain);
        }

        return builder.build();
    }

    public ResponseCookie createClearCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(secure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax");

        if (domain != null && !domain.isEmpty()) {
            builder.domain(domain);
        }

        return builder.build();
    }
}
