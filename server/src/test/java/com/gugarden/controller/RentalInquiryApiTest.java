package com.gugarden.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class RentalInquiryApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Test
    @DisplayName("렌탈 문의 접수 성공 (비인증 가능) - 201")
    void submitInquiry_success() throws Exception {
        Map<String, String> request = Map.of(
                "name", "테스트고객",
                "email", "rental@test.com",
                "phone", "010-5555-6666",
                "workName", "Rental Work 1",
                "rentalPeriod", "3개월",
                "purpose", "카페 인테리어",
                "message", "렌탈 문의 드립니다."
        );

        mockMvc.perform(post("/api/rental/inquiry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.inquiryId").isNumber());
    }

    @Test
    @DisplayName("필수값 누락 시 에러")
    void submitInquiry_missingRequired() throws Exception {
        // name, email, phone 누락
        Map<String, String> request = Map.of(
                "workName", "Rental Work 1"
        );

        mockMvc.perform(post("/api/rental/inquiry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
