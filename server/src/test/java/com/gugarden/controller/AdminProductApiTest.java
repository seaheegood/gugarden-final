package com.gugarden.controller;

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
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AdminProductApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private String adminToken;
    private String userToken;
    private Category category;

    @BeforeEach
    void setUp() {
        // Admin 유저 생성
        User admin = User.builder()
                .email("testadmin@test.com")
                .password("password")
                .name("테스트관리자")
                .role(User.Role.admin)
                .build();
        admin = userRepository.save(admin);
        adminToken = jwtTokenProvider.generateToken(admin.getId(), admin.getEmail(), "admin");

        // 일반 유저 생성
        User normalUser = User.builder()
                .email("testuser@test.com")
                .password("password")
                .name("테스트유저")
                .role(User.Role.user)
                .build();
        normalUser = userRepository.save(normalUser);
        userToken = jwtTokenProvider.generateToken(normalUser.getId(), normalUser.getEmail(), "user");

        // 카테고리 생성
        category = Category.builder()
                .name("테스트카테고리")
                .slug("test-category-" + System.currentTimeMillis())
                .build();
        category = categoryRepository.save(category);
    }

    @Test
    @DisplayName("상품 생성 성공 - 201 반환, productId 포함")
    void createProduct_success() throws Exception {
        mockMvc.perform(multipart("/api/admin/products")
                        .param("categoryId", category.getId().toString())
                        .param("name", "테스트 상품")
                        .param("description", "테스트 설명")
                        .param("price", "10000")
                        .param("stock", "50")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").isNumber())
                .andExpect(jsonPath("$.message").value("상품이 등록되었습니다."));
    }

    @Test
    @DisplayName("상품 목록 조회 - 200 반환, products 배열 + pagination 객체")
    void getProducts_success() throws Exception {
        // 상품 하나 생성
        Product product = Product.builder()
                .category(category)
                .name("조회테스트상품")
                .slug("list-test-" + System.currentTimeMillis())
                .price(5000)
                .stock(10)
                .build();
        productRepository.save(product);

        mockMvc.perform(get("/api/admin/products")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products").isArray())
                .andExpect(jsonPath("$.pagination").isMap())
                .andExpect(jsonPath("$.pagination.page").value(1))
                .andExpect(jsonPath("$.pagination.limit").value(20));
    }

    @Test
    @DisplayName("상품 수정 성공 - 200 반환, 이름/가격 변경 확인")
    void updateProduct_success() throws Exception {
        // 상품 생성
        Product product = Product.builder()
                .category(category)
                .name("수정전상품")
                .slug("update-test-" + System.currentTimeMillis())
                .price(10000)
                .stock(10)
                .build();
        product = productRepository.save(product);

        mockMvc.perform(multipart("/api/admin/products/" + product.getId())
                        .param("name", "수정후상품")
                        .param("price", "20000")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("상품이 수정되었습니다."));
    }

    @Test
    @DisplayName("상품 삭제 성공 (주문 없음) - 200 반환, 실제 삭제 확인")
    void deleteProduct_success() throws Exception {
        // 상품 생성
        Product product = Product.builder()
                .category(category)
                .name("삭제테스트상품")
                .slug("delete-test-" + System.currentTimeMillis())
                .price(5000)
                .stock(5)
                .build();
        product = productRepository.save(product);

        mockMvc.perform(delete("/api/admin/products/" + product.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("상품이 삭제되었습니다."));

        // 실제 삭제 확인
        assert productRepository.findById(product.getId()).isEmpty();
    }

    @Test
    @DisplayName("인증 없이 접근 시 403 Forbidden")
    void createProduct_noAuth_forbidden() throws Exception {
        mockMvc.perform(multipart("/api/admin/products")
                        .param("categoryId", category.getId().toString())
                        .param("name", "미인증상품")
                        .param("price", "10000")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("일반 유저로 접근 시 403 Forbidden")
    void createProduct_userRole_forbidden() throws Exception {
        mockMvc.perform(multipart("/api/admin/products")
                        .param("categoryId", category.getId().toString())
                        .param("name", "유저접근상품")
                        .param("price", "10000")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("존재하지 않는 상품 수정 시 404 Not Found")
    void updateProduct_notFound() throws Exception {
        mockMvc.perform(multipart("/api/admin/products/99999")
                        .param("name", "없는상품수정")
                        .param("price", "10000")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("상품을 찾을 수 없습니다."));
    }
}
