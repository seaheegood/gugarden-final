package com.gugarden.service;

import com.gugarden.entity.Category;
import com.gugarden.entity.Product;
import com.gugarden.entity.ProductImage;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.repository.CategoryRepository;
import com.gugarden.repository.OrderItemRepository;
import com.gugarden.repository.ProductImageRepository;
import com.gugarden.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final OrderItemRepository orderItemRepository;
    private final FileUploadService fileUploadService;

    public Map<String, Object> getAllActiveProducts() {
        List<Product> products = productRepository.findAllActive();
        return Map.of("products", products.stream().map(this::toProductMap).toList());
    }

    public Map<String, Object> getProductsByCategory(String slug) {
        List<Product> products = productRepository.findByCategorySlugAndActive(slug);
        return Map.of("products", products.stream().map(this::toProductMap).toList());
    }

    public Map<String, Object> getFeaturedProducts() {
        List<Product> products = productRepository.findFeatured();
        return Map.of("products", products.stream().map(this::toProductMap).toList());
    }

    public Map<String, Object> getRentableProducts() {
        List<Product> products = productRepository.findRentable();
        return Map.of("products", products.stream().map(this::toProductMap).toList());
    }

    public Map<String, Object> getProductDetail(Integer id) {
        Product product = productRepository.findByIdAndActive(id)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);

        Map<String, Object> productMap = toProductMap(product);
        productMap.put("images", images.stream().map(img -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", img.getId());
            m.put("product_id", img.getProduct().getId());
            m.put("image_url", img.getImageUrl());
            m.put("sort_order", img.getSortOrder());
            m.put("created_at", img.getCreatedAt());
            return m;
        }).toList());

        return Map.of("product", productMap);
    }

    @Transactional
    public Map<String, Object> createProduct(Integer categoryId, String name, String slug,
                                              String description, Integer price, Integer salePrice,
                                              Integer stock, Boolean isFeatured, MultipartFile thumbnailFile) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));

        String thumbnail = fileUploadService.uploadFile(thumbnailFile);

        Product product = Product.builder()
                .category(category)
                .name(name)
                .slug(slug)
                .description(description)
                .price(price)
                .salePrice(salePrice)
                .stock(stock != null ? stock : 0)
                .thumbnail(thumbnail)
                .isFeatured(isFeatured != null ? isFeatured : false)
                .build();

        productRepository.save(product);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "상품이 등록되었습니다.");
        result.put("productId", product.getId());
        return result;
    }

    @Transactional
    public Map<String, String> updateProduct(Integer id, Integer categoryId, String name, String slug,
                                              String description, Integer price, Integer salePrice,
                                              Integer stock, Boolean isActive, Boolean isFeatured,
                                              MultipartFile thumbnailFile) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
            product.setCategory(category);
        }
        if (name != null) product.setName(name);
        if (slug != null) product.setSlug(slug);
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        product.setSalePrice(salePrice);
        if (stock != null) product.setStock(stock);
        if (isActive != null) product.setIsActive(isActive);
        if (isFeatured != null) product.setIsFeatured(isFeatured);

        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            product.setThumbnail(fileUploadService.uploadFile(thumbnailFile));
        }

        productRepository.save(product);

        return Map.of("message", "상품이 수정되었습니다.");
    }

    @Transactional
    public Map<String, String> deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        productRepository.delete(product);
        return Map.of("message", "상품이 삭제되었습니다.");
    }

    @Transactional
    public Map<String, String> addProductImages(Integer productId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("이미지 파일이 필요합니다.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        for (int i = 0; i < files.size(); i++) {
            String imageUrl = fileUploadService.uploadFile(files.get(i));
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .sortOrder(i)
                    .build();
            productImageRepository.save(image);
        }

        return Map.of("message", "이미지가 추가되었습니다.");
    }

    @Transactional
    public Map<String, String> deleteProductImage(Integer imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("이미지를 찾을 수 없습니다."));

        productImageRepository.delete(image);
        return Map.of("message", "이미지가 삭제되었습니다.");
    }

    private Map<String, Object> toProductMap(Product product) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", product.getId());
        map.put("category_id", product.getCategory().getId());
        map.put("name", product.getName());
        map.put("slug", product.getSlug());
        map.put("description", product.getDescription());
        map.put("price", product.getPrice());
        map.put("sale_price", product.getSalePrice());
        map.put("stock", product.getStock());
        map.put("thumbnail", product.getThumbnail());
        map.put("is_active", product.getIsActive());
        map.put("is_featured", product.getIsFeatured());
        map.put("is_rentable", product.getIsRentable());
        map.put("created_at", product.getCreatedAt());
        map.put("updated_at", product.getUpdatedAt());
        map.put("category_name", product.getCategory().getName());
        map.put("category_slug", product.getCategory().getSlug());
        return map;
    }
}
