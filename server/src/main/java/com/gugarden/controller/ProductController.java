package com.gugarden.controller;

import com.gugarden.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/category/{slug}")
    public ResponseEntity<Map<String, Object>> getByCategory(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductsByCategory(slug));
    }

    @GetMapping("/featured")
    public ResponseEntity<Map<String, Object>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/rentable")
    public ResponseEntity<Map<String, Object>> getRentable() {
        return ResponseEntity.ok(productService.getRentableProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.deleteProduct(id));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<Map<String, String>> addImages(
            @PathVariable Integer id,
            @RequestParam("images") List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.addProductImages(id, images));
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable Integer imageId) {
        return ResponseEntity.ok(productService.deleteProductImage(imageId));
    }
}
