package com.gugarden.controller;

import com.gugarden.dto.request.RoleRequest;
import com.gugarden.dto.request.StatusRequest;
import com.gugarden.security.UserPrincipal;
import com.gugarden.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ==================== Orders ====================

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getOrders(page, limit, status));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getOrderDetail(id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Integer id,
            @RequestBody StatusRequest request) {
        return ResponseEntity.ok(adminService.updateOrderStatus(id, request.getStatus()));
    }

    // ==================== Products ====================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getProducts(page, limit, category, search));
    }

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
            @RequestParam(required = false) MultipartFile thumbnailFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createProduct(categoryId, name, description, price, salePrice, stock, thumbnail, isActive, isFeatured, thumbnailFile));
    }

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
            @RequestParam(required = false) MultipartFile thumbnailFile) {
        return ResponseEntity.ok(adminService.updateProduct(id, categoryId, name, description, price, salePrice, stock, thumbnail, isActive, isFeatured, thumbnailFile));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteProduct(id));
    }

    // ==================== Product Images ====================

    @GetMapping("/products/{id}/images")
    public ResponseEntity<Map<String, Object>> getProductImages(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getProductImages(id));
    }

    @PostMapping("/products/{id}/images")
    public ResponseEntity<Map<String, Object>> addProductImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.addProductImages(id, images));
    }

    @DeleteMapping("/products/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteProductImage(@PathVariable Integer imageId) {
        return ResponseEntity.ok(adminService.deleteProductImage(imageId));
    }

    // ==================== Users ====================

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getUsers(page, limit, search));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody RoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole(), principal.getId()));
    }

    // ==================== Categories ====================

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(adminService.getCategories());
    }

    // ==================== Rental Inquiries ====================

    @GetMapping("/rental-inquiries")
    public ResponseEntity<Map<String, Object>> getRentalInquiries(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getRentalInquiries(page, limit, status));
    }

    @GetMapping("/rental-inquiries/{id}")
    public ResponseEntity<Map<String, Object>> getRentalInquiryDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getRentalInquiryDetail(id));
    }

    @PutMapping("/rental-inquiries/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRentalInquiryStatus(
            @PathVariable Integer id,
            @RequestBody StatusRequest request) {
        return ResponseEntity.ok(adminService.updateRentalInquiryStatus(id, request.getStatus()));
    }

    @DeleteMapping("/rental-inquiries/{id}")
    public ResponseEntity<Map<String, String>> deleteRentalInquiry(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.deleteRentalInquiry(id));
    }
}
