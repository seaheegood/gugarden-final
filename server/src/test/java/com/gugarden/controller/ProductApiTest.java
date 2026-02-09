package com.gugarden.controller;

import com.gugarden.entity.Category;
import com.gugarden.entity.Product;
import com.gugarden.repository.CategoryRepository;
import com.gugarden.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ProductApiTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .name("공개상품카테고리")
                .slug("public-cat-" + System.currentTimeMillis())
                .build();
        category = categoryRepository.save(category);

        product = Product.builder()
                .category(category)
                .name("공개테스트상품")
                .slug("public-product-" + System.currentTimeMillis())
                .price(20000)
                .stock(30)
                .isActive(true)
                .isFeatured(true)
                .build();
        product = productRepository.save(product);
    }

    @Test
    @DisplayName("전체 상품 목록 조회 (비인증 가능) - 200")
    void getAllProducts_success() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products").isArray());
    }

    @Test
    @DisplayName("카테고리별 상품 조회 - 200")
    void getByCategory_success() throws Exception {
        mockMvc.perform(get("/api/products/category/" + category.getSlug()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products").isArray());
    }

    @Test
    @DisplayName("추천 상품 조회 - 200")
    void getFeatured_success() throws Exception {
        mockMvc.perform(get("/api/products/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.products").isArray());
    }

    @Test
    @DisplayName("상품 상세 조회 - 200")
    void getDetail_success() throws Exception {
        mockMvc.perform(get("/api/products/" + product.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.product").isMap())
                .andExpect(jsonPath("$.product.name").value("공개테스트상품"))
                .andExpect(jsonPath("$.product.price").value(20000));
    }

    @Test
    @DisplayName("없는 상품 조회 시 404")
    void getDetail_notFound() throws Exception {
        mockMvc.perform(get("/api/products/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }
}
