package com.gugarden.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gugarden.entity.User;
import com.gugarden.repository.UserRepository;
import com.gugarden.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;

    private User existingUser;
    private String userToken;

    @BeforeEach
    void setUp() {
        existingUser = User.builder()
                .email("auth-test@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("인증테스트유저")
                .phone("010-1234-5678")
                .build();
        existingUser = userRepository.save(existingUser);
        userToken = jwtTokenProvider.generateToken(existingUser.getId(), existingUser.getEmail(), "user");
    }

    @Test
    @DisplayName("회원가입 성공 - 201 반환, token + user 정보")
    void register_success() throws Exception {
        Map<String, String> request = Map.of(
                "email", "newuser@test.com",
                "password", "newpass123",
                "name", "신규유저"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(jsonPath("$.user.email").value("newuser@test.com"))
                .andExpect(jsonPath("$.message").value("회원가입이 완료되었습니다."));
    }

    @Test
    @DisplayName("중복 이메일 가입 실패 - 400")
    void register_duplicateEmail() throws Exception {
        Map<String, String> request = Map.of(
                "email", "auth-test@test.com",
                "password", "password123",
                "name", "중복유저"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("이미 사용 중인 이메일입니다."));
    }

    @Test
    @DisplayName("로그인 성공 - 200, token + user 정보")
    void login_success() throws Exception {
        Map<String, String> request = Map.of(
                "email", "auth-test@test.com",
                "password", "password123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(jsonPath("$.user.email").value("auth-test@test.com"))
                .andExpect(jsonPath("$.message").value("로그인 성공"));
    }

    @Test
    @DisplayName("잘못된 비밀번호 로그인 - 401")
    void login_wrongPassword() throws Exception {
        Map<String, String> request = Map.of(
                "email", "auth-test@test.com",
                "password", "wrongpassword"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("이메일 또는 비밀번호가 일치하지 않습니다."));
    }

    @Test
    @DisplayName("내 정보 조회 - 200, user 정보")
    void getMe_success() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("auth-test@test.com"))
                .andExpect(jsonPath("$.user.name").value("인증테스트유저"));
    }

    @Test
    @DisplayName("프로필 수정 - 200")
    void updateProfile_success() throws Exception {
        Map<String, String> request = Map.of(
                "name", "수정된이름",
                "phone", "010-9999-8888"
        );

        mockMvc.perform(put("/api/auth/me")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("정보가 수정되었습니다."));
    }

    @Test
    @DisplayName("비밀번호 변경 - 200")
    void changePassword_success() throws Exception {
        Map<String, String> request = Map.of(
                "currentPassword", "password123",
                "newPassword", "newpass456"
        );

        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("비밀번호가 변경되었습니다."));
    }

    @Test
    @DisplayName("회원 탈퇴 - 200")
    void deleteAccount_success() throws Exception {
        mockMvc.perform(delete("/api/auth/me")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("회원 탈퇴가 완료되었습니다."));
    }

    @Test
    @DisplayName("비인증 상태로 /me 접근 시 403")
    void getMe_noAuth_forbidden() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }
}
