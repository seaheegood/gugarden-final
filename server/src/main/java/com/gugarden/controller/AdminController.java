package com.gugarden.controller;

import com.gugarden.dto.request.RoleRequest;
import com.gugarden.dto.request.StatusRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "관리자", description = "관리자 전용 API (ADMIN 권한 필요)")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ==================== Dashboard ====================

    @Operation(summary = "대시보드 통계", description = "총 주문/매출, 오늘 주문/매출, 회원수, 상품수 등을 조회합니다.")
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ==================== Orders ====================

    @Operation(summary = "주문 목록 조회 (페이지네이션)")
    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getOrders(page, limit, status));
    }

    @Operation(summary = "주문 상세 조회")
    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(@Parameter(description = "주문 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getOrderDetail(id));
    }

    @Operation(summary = "주문 상태 변경", description = "취소 시 재고가 자동 복구됩니다.")
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, request.getStatus()));
    }

    // ==================== Products ====================

    @Operation(summary = "상품 목록 조회 (페이지네이션)")
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getProducts(page, limit, category, search));
    }

    @Operation(summary = "상품 생성")
    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(
            @RequestParam("categoryId") Integer categoryId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam Integer price,
            @RequestParam(required = false) Integer salePrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) String thumbnail,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isRentable,
            @RequestParam(required = false) MultipartFile thumbnailFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createProduct(categoryId, name, description, price, salePrice, stock, thumbnail, isActive, isFeatured, isRentable, thumbnailFile));
    }

    @Operation(summary = "상품 수정")
    @PutMapping("/products/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer price,
            @RequestParam(required = false) Integer salePrice,
            @RequestParam(required = false) Integer stock,
            @RequestParam(required = false) String thumbnail,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isRentable,
            @RequestParam(required = false) MultipartFile thumbnailFile) {
        return ResponseEntity.ok(adminService.updateProduct(id, categoryId, name, description, price, salePrice, stock, thumbnail, isActive, isFeatured, isRentable, thumbnailFile));
    }

    @Operation(summary = "상품 삭제", description = "주문 이력이 있으면 비활성화, 없으면 완전 삭제됩니다.")
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@Parameter(description = "상품 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteProduct(id));
    }

    // ==================== Product Images ====================

    @Operation(summary = "상품 이미지 목록 조회")
    @GetMapping("/products/{id}/images")
    public ResponseEntity<Map<String, Object>> getProductImages(@Parameter(description = "상품 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getProductImages(id));
    }

    @Operation(summary = "상품 이미지 추가", description = "최대 10개")
    @PostMapping("/products/{id}/images")
    public ResponseEntity<Map<String, Object>> addProductImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addProductImages(id, images));
    }

    @Operation(summary = "상품 이미지 삭제")
    @DeleteMapping("/products/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteProductImage(@Parameter(description = "이미지 ID") @PathVariable Integer imageId) {
        return ResponseEntity.ok(adminService.deleteProductImage(imageId));
    }

    // ==================== Users ====================

    @Operation(summary = "회원 목록 조회 (페이지네이션)")
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getUsers(page, limit, search));
    }

    @Operation(summary = "회원 상세 조회", description = "회원 정보와 최근 주문 10건을 함께 반환합니다.")
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserDetail(@Parameter(description = "회원 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @Operation(summary = "회원 역할 변경", description = "자기 자신의 역할은 변경할 수 없습니다.")
    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole(), principal.getId()));
    }

    // ==================== Categories ====================

    @Operation(summary = "카테고리 목록 조회", description = "각 카테고리의 상품 수를 포함하여 반환합니다.")
    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(adminService.getCategories());
    }

    // ==================== Rental Inquiries ====================

    @Operation(summary = "렌탈 문의 목록 조회 (페이지네이션)")
    @GetMapping("/rental-inquiries")
    public ResponseEntity<Map<String, Object>> getRentalInquiries(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getRentalInquiries(page, limit, status));
    }

    @Operation(summary = "렌탈 문의 상세 조회")
    @GetMapping("/rental-inquiries/{id}")
    public ResponseEntity<Map<String, Object>> getRentalInquiryDetail(@Parameter(description = "문의 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getRentalInquiryDetail(id));
    }

    @Operation(summary = "렌탈 문의 상태 변경")
    @PutMapping("/rental-inquiries/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRentalInquiryStatus(
            @PathVariable Integer id,
            @Valid @RequestBody StatusRequest request) {
        return ResponseEntity.ok(adminService.updateRentalInquiryStatus(id, request.getStatus()));
    }

    @Operation(summary = "렌탈 문의 삭제")
    @DeleteMapping("/rental-inquiries/{id}")
    public ResponseEntity<Map<String, String>> deleteRentalInquiry(@Parameter(description = "문의 ID") @PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteRentalInquiry(id));
    }
}
