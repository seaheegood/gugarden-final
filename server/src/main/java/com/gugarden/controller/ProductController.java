package com.gugarden.controller;

import com.gugarden.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "상품", description = "상품 조회/관리 API")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "상품 목록 조회", description = "활성화된 전체 상품 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @Operation(summary = "카테고리별 상품 조회")
    @GetMapping("/category/{slug}")
    public ResponseEntity<Map<String, Object>> getByCategory(@Parameter(description = "카테고리 slug") @PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductsByCategory(slug));
    }

    @Operation(summary = "추천 상품 조회", description = "is_featured=true인 상품을 최대 8개 조회합니다.")
    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @Operation(summary = "렌탈 가능 상품 조회")
    @GetMapping("/rentable")
    public ResponseEntity<Map<String, Object>> getRentable() {
        return ResponseEntity.ok(productService.getRentableProducts());
    }

    @Operation(summary = "상품 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDetail(@Parameter(description = "상품 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    @Operation(summary = "상품 생성", description = "관리자 전용")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestParam("category_id") Integer categoryId,
            @RequestParam String name,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String description,
            @RequestParam Integer price,
            @RequestParam(name = "sale_price", required = false) Integer salePrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(name = "is_featured", required = false) Boolean isFeatured,
            @RequestParam(required = false) MultipartFile thumbnail) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(categoryId, name, slug, description, price, salePrice, stock, isFeatured, thumbnail));
    }

    @Operation(summary = "상품 수정", description = "관리자 전용")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> update(
            @PathVariable Integer id,
            @RequestParam(name = "category_id", required = false) Integer categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer price,
            @RequestParam(name = "sale_price", required = false) Integer salePrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(name = "is_active", required = false) Boolean isActive,
            @RequestParam(name = "is_featured", required = false) Boolean isFeatured,
            @RequestParam(required = false) MultipartFile thumbnail) {
        return ResponseEntity.ok(productService.updateProduct(id, categoryId, name, slug, description, price, salePrice, stock, isActive, isFeatured, thumbnail));
    }

    @Operation(summary = "상품 삭제", description = "관리자 전용")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@Parameter(description = "상품 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @Operation(summary = "상품 이미지 추가", description = "관리자 전용, 최대 10개")
    @PostMapping("/{id}/images")
    public ResponseEntity<Map<String, String>> addImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.addProductImages(id, images));
    }

    @Operation(summary = "상품 이미지 삭제", description = "관리자 전용")
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteImage(@Parameter(description = "이미지 ID") @PathVariable Integer imageId) {
        return ResponseEntity.ok(productService.deleteProductImage(imageId));
    }
}
