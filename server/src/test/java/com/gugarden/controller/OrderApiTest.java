package com.gugarden.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gugarden.entity.*;
import com.gugarden.repository.*;
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
class OrderApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private User user;
    private User otherUser;
    private String userToken;
    private String otherUserToken;
    private Product product;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email("order-test@test.com")
                .password("password")
                .name("주문테스트유저")
                .build();
        user = userRepository.save(user);
        userToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), "user");

        otherUser = User.builder()
                .email("order-other@test.com")
                .password("password")
                .name("다른유저")
                .build();
        otherUser = userRepository.save(otherUser);
        otherUserToken = jwtTokenProvider.generateToken(otherUser.getId(), otherUser.getEmail(), "user");

        Category category = Category.builder()
                .name("주문카테고리")
                .slug("order-cat-" + System.currentTimeMillis())
                .build();
        category = categoryRepository.save(category);

        product = Product.builder()
                .category(category)
                .name("주문테스트상품")
                .slug("order-product-" + System.currentTimeMillis())
                .price(30000)
                .stock(50)
                .build();
        product = productRepository.save(product);

        // 장바구니에 상품 추가 (주문 생성에 필요)
        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(2)
                .build();
        cartItemRepository.save(cartItem);
    }

    @Test
    @DisplayName("주문 생성 - 201, orderId + orderNumber 반환")
    void createOrder_success() throws Exception {
        Map<String, String> request = Map.of(
                "recipientName", "홍길동",
                "recipientPhone", "010-1111-2222",
                "recipientAddress", "서울시 강남구",
                "recipientAddressDetail", "101호",
                "recipientZipcode", "06100",
                "paymentMethod", "naverpay"
        );

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").isNumber())
                .andExpect(jsonPath("$.orderNumber").isString())
                .andExpect(jsonPath("$.totalAmount").isNumber());
    }

    @Test
    @DisplayName("주문 목록 조회 - 200, orders 배열")
    void getOrders_success() throws Exception {
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders").isArray());
    }

    @Test
    @DisplayName("주문 상세 조회 - 200")
    void getOrderDetail_success() throws Exception {
        // 주문 생성
        Map<String, String> request = Map.of(
                "recipientName", "홍길동",
                "recipientPhone", "010-1111-2222",
                "recipientAddress", "서울시 강남구",
                "paymentMethod", "naverpay"
        );
        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();
        Integer orderId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("orderId").asInt();

        // 상세 조회
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order").isMap())
                .andExpect(jsonPath("$.order.id").value(orderId));
    }

    @Test
    @DisplayName("주문 취소 - 200")
    void cancelOrder_success() throws Exception {
        // 주문 생성
        Map<String, String> request = Map.of(
                "recipientName", "홍길동",
                "recipientPhone", "010-1111-2222",
                "recipientAddress", "서울시 강남구",
                "paymentMethod", "naverpay"
        );
        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();
        Integer orderId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("orderId").asInt();

        // 취소
        mockMvc.perform(put("/api/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("주문이 취소되었습니다."));
    }

    @Test
    @DisplayName("타인 주문 조회 차단 - 404")
    void getOrderDetail_otherUser_notFound() throws Exception {
        // user로 주문 생성
        Map<String, String> request = Map.of(
                "recipientName", "홍길동",
                "recipientPhone", "010-1111-2222",
                "recipientAddress", "서울시 강남구",
                "paymentMethod", "naverpay"
        );
        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn();
        Integer orderId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("orderId").asInt();

        // 다른 유저로 조회 시도
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isNotFound());
    }
}
