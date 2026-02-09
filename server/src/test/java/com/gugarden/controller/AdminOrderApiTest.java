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
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminOrderApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private String adminToken;
    private Order order;

    @BeforeEach
    void setUp() {
        // Admin 유저
        User admin = User.builder()
                .email("admin-order-test@test.com")
                .password("password")
                .name("관리자")
                .role(User.Role.admin)
                .build();
        admin = userRepository.save(admin);
        adminToken = jwtTokenProvider.generateToken(admin.getId(), admin.getEmail(), "admin");

        // 일반 유저 (주문자)
        User buyer = User.builder()
                .email("buyer-test@test.com")
                .password("password")
                .name("구매자")
                .build();
        buyer = userRepository.save(buyer);

        // 카테고리 + 상품
        Category category = Category.builder()
                .name("관리자주문카테고리")
                .slug("admin-order-cat-" + System.currentTimeMillis())
                .build();
        category = categoryRepository.save(category);

        Product product = Product.builder()
                .category(category)
                .name("관리자주문상품")
                .slug("admin-order-product-" + System.currentTimeMillis())
                .price(25000)
                .stock(20)
                .build();
        product = productRepository.save(product);

        // 주문 생성
        order = Order.builder()
                .user(buyer)
                .orderNumber("GG" + System.currentTimeMillis())
                .totalAmount(50000)
                .shippingFee(3000)
                .recipientName("홍길동")
                .recipientPhone("010-1234-5678")
                .recipientAddress("서울시 강남구")
                .paymentMethod("naverpay")
                .build();
        order = orderRepository.save(order);

        // 주문 아이템
        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .productName(product.getName())
                .productPrice(product.getPrice())
                .quantity(2)
                .build();
        orderItemRepository.save(orderItem);
    }

    @Test
    @DisplayName("관리자 주문 목록 조회 - 200, pagination 포함")
    void getOrders_success() throws Exception {
        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orders").isArray())
                .andExpect(jsonPath("$.pagination").isMap());
    }

    @Test
    @DisplayName("관리자 주문 상세 조회 - 200")
    void getOrderDetail_success() throws Exception {
        mockMvc.perform(get("/api/admin/orders/" + order.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.order").isMap())
                .andExpect(jsonPath("$.order.id").value(order.getId()));
    }

    @Test
    @DisplayName("주문 상태 변경 - 200")
    void updateOrderStatus_success() throws Exception {
        Map<String, String> request = Map.of("status", "paid");

        mockMvc.perform(put("/api/admin/orders/" + order.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("주문 상태가 변경되었습니다."))
                .andExpect(jsonPath("$.status").value("paid"));
    }

    @Test
    @DisplayName("잘못된 상태값으로 변경 시 400")
    void updateOrderStatus_invalidStatus() throws Exception {
        Map<String, String> request = Map.of("status", "invalid_status");

        mockMvc.perform(put("/api/admin/orders/" + order.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("유효하지 않은 상태입니다."));
    }
}
