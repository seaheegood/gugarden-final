package com.gugarden.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gugarden.entity.Category;
import com.gugarden.entity.Product;
import com.gugarden.entity.User;
import com.gugarden.repository.CategoryRepository;
import com.gugarden.repository.ProductRepository;
import com.gugarden.repository.UserRepository;
import com.gugarden.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CartApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private String userToken;
    private Product product;

    @BeforeEach
    void setUp() {
        User user = User.builder()
                .email("cart-test@test.com")
                .password("password")
                .name("장바구니테스트유저")
                .build();
        user = userRepository.save(user);
        userToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), "user");

        Category category = Category.builder()
                .name("장바구니카테고리")
                .slug("cart-cat-" + System.currentTimeMillis())
                .build();
        category = categoryRepository.save(category);

        product = Product.builder()
                .category(category)
                .name("장바구니테스트상품")
                .slug("cart-product-" + System.currentTimeMillis())
                .price(15000)
                .stock(100)
                .build();
        product = productRepository.save(product);
    }

    @Test
    @DisplayName("장바구니 조회 - 200, items 배열")
    void getCart_success() throws Exception {
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.totalAmount").isNumber());
    }

    @Test
    @DisplayName("상품 추가 - 200")
    void addToCart_success() throws Exception {
        Map<String, Object> request = Map.of(
                "productId", product.getId(),
                "quantity", 2
        );

        mockMvc.perform(post("/api/cart")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("수량 변경 - 200")
    void updateQuantity_success() throws Exception {
        // 먼저 상품 추가
        Map<String, Object> addRequest = Map.of("productId", product.getId(), "quantity", 1);
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // 장바구니 조회하여 cartItemId 획득
        MvcResult result = mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andReturn();
        Integer cartItemId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("items").get(0).get("id").asInt();

        // 수량 변경
        Map<String, Object> updateRequest = Map.of("quantity", 5);
        mockMvc.perform(put("/api/cart/" + cartItemId)
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("항목 삭제 - 200")
    void removeItem_success() throws Exception {
        // 상품 추가
        Map<String, Object> addRequest = Map.of("productId", product.getId(), "quantity", 1);
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // cartItemId 획득
        MvcResult result = mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andReturn();
        Integer cartItemId = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("items").get(0).get("id").asInt();

        // 삭제
        mockMvc.perform(delete("/api/cart/" + cartItemId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("전체 비우기 - 200")
    void clearCart_success() throws Exception {
        // 상품 추가
        Map<String, Object> addRequest = Map.of("productId", product.getId(), "quantity", 1);
        mockMvc.perform(post("/api/cart")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addRequest)));

        // 전체 비우기
        mockMvc.perform(delete("/api/cart")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("비인증 시 장바구니 접근 - 403")
    void getCart_noAuth_forbidden() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }
}
