package com.gugarden.service;

import com.gugarden.entity.*;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final RentalInquiryRepository rentalInquiryRepository;
    private final FileUploadService fileUploadService;

    // ==================== Dashboard ====================

    public Map<String, Object> getDashboard() {
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.countActive();
        long pendingOrders = orderRepository.countPending();

        // Revenue - use native query approach
        long totalRevenue = orderRepository.sumTotalRevenue();

        List<Order> recentOrders = orderRepository.findTop5RecentOrders(PageRequest.of(0, 5));

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("todayOrders", 0); // simplified
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", 0); // simplified
        stats.put("totalUsers", totalUsers);
        stats.put("totalProducts", totalProducts);
        stats.put("pendingOrders", pendingOrders);

        List<Map<String, Object>> recentOrderList = recentOrders.stream().map(o -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", o.getId());
            map.put("order_number", o.getOrderNumber());
            map.put("total_amount", o.getTotalAmount());
            map.put("status", o.getStatus().name());
            map.put("created_at", o.getCreatedAt());
            map.put("user_name", o.getUser() != null ? o.getUser().getName() : null);
            map.put("user_email", o.getUser() != null ? o.getUser().getEmail() : null);
            return map;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("stats", stats);
        result.put("recentOrders", recentOrderList);
        return result;
    }

    // ==================== Orders ====================

    public Map<String, Object> getOrders(int page, int limit, String status) {
        Order.OrderStatus orderStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                orderStatus = Order.OrderStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("유효하지 않은 상태입니다.");
            }
        }

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Order> orderPage = orderRepository.findAllForAdmin(orderStatus, pageRequest);

        List<Map<String, Object>> orders = orderPage.getContent().stream().map(o -> {
            long itemCount = orderItemRepository.countByOrderId(o.getId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", o.getId());
            map.put("user_id", o.getUser() != null ? o.getUser().getId() : null);
            map.put("order_number", o.getOrderNumber());
            map.put("total_amount", o.getTotalAmount());
            map.put("shipping_fee", o.getShippingFee());
            map.put("status", o.getStatus().name());
            map.put("recipient_name", o.getRecipientName());
            map.put("recipient_phone", o.getRecipientPhone());
            map.put("payment_method", o.getPaymentMethod());
            map.put("created_at", o.getCreatedAt());
            map.put("user_name", o.getUser() != null ? o.getUser().getName() : null);
            map.put("user_email", o.getUser() != null ? o.getUser().getEmail() : null);
            map.put("item_count", itemCount);
            return map;
        }).toList();

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", orderPage.getTotalElements());
        pagination.put("totalPages", orderPage.getTotalPages());

        Map<String, Object> result = new HashMap<>();
        result.put("orders", orders);
        result.put("pagination", pagination);
        return result;
    }

    public Map<String, Object> getOrderDetail(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);

        Map<String, Object> orderMap = new LinkedHashMap<>();
        orderMap.put("id", order.getId());
        orderMap.put("user_id", order.getUser() != null ? order.getUser().getId() : null);
        orderMap.put("order_number", order.getOrderNumber());
        orderMap.put("total_amount", order.getTotalAmount());
        orderMap.put("shipping_fee", order.getShippingFee());
        orderMap.put("status", order.getStatus().name());
        orderMap.put("recipient_name", order.getRecipientName());
        orderMap.put("recipient_phone", order.getRecipientPhone());
        orderMap.put("recipient_address", order.getRecipientAddress());
        orderMap.put("recipient_address_detail", order.getRecipientAddressDetail());
        orderMap.put("recipient_zipcode", order.getRecipientZipcode());
        orderMap.put("memo", order.getMemo());
        orderMap.put("payment_method", order.getPaymentMethod());
        orderMap.put("payment_key", order.getPaymentKey());
        orderMap.put("paid_at", order.getPaidAt());
        orderMap.put("created_at", order.getCreatedAt());
        orderMap.put("updated_at", order.getUpdatedAt());
        if (order.getUser() != null) {
            orderMap.put("user_name", order.getUser().getName());
            orderMap.put("user_email", order.getUser().getEmail());
            orderMap.put("user_phone", order.getUser().getPhone());
        }

        orderMap.put("items", items.stream().map(item -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", item.getId());
            m.put("order_id", item.getOrder().getId());
            m.put("product_id", item.getProduct().getId());
            m.put("product_name", item.getProductName());
            m.put("product_price", item.getProductPrice());
            m.put("quantity", item.getQuantity());
            m.put("created_at", item.getCreatedAt());
            m.put("thumbnail", item.getProduct() != null ? item.getProduct().getThumbnail() : null);
            return m;
        }).toList());

        return Map.of("order", orderMap);
    }

    @Transactional
    public Map<String, Object> updateOrderStatus(Integer orderId, String status) {
        List<String> validStatuses = List.of("pending", "paid", "preparing", "shipped", "delivered", "cancelled");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("유효하지 않은 상태입니다.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);

        // 취소로 변경 시 재고 복구
        if (newStatus == Order.OrderStatus.cancelled && order.getStatus() != Order.OrderStatus.cancelled) {
            List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);
            for (OrderItem item : items) {
                productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        return Map.of("message", "주문 상태가 변경되었습니다.", "status", status);
    }

    // ==================== Products ====================

    public Map<String, Object> getProducts(int page, int limit, String category, String search) {
        String cat = (category != null && !category.isEmpty()) ? category : null;
        String srch = (search != null && !search.isEmpty()) ? search : null;

        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> productPage = productRepository.findAllForAdmin(cat, srch, pageRequest);

        List<Map<String, Object>> products = productPage.getContent().stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("category_id", p.getCategory().getId());
            map.put("name", p.getName());
            map.put("slug", p.getSlug());
            map.put("description", p.getDescription());
            map.put("price", p.getPrice());
            map.put("sale_price", p.getSalePrice());
            map.put("stock", p.getStock());
            map.put("thumbnail", p.getThumbnail());
            map.put("is_active", p.getIsActive());
            map.put("is_featured", p.getIsFeatured());
            map.put("created_at", p.getCreatedAt());
            map.put("updated_at", p.getUpdatedAt());
            map.put("category_name", p.getCategory().getName());
            map.put("category_slug", p.getCategory().getSlug());
            return map;
        }).toList();

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", productPage.getTotalElements());
        pagination.put("totalPages", productPage.getTotalPages());

        Map<String, Object> result = new HashMap<>();
        result.put("products", products);
        result.put("pagination", pagination);
        return result;
    }

    @Transactional
    public Map<String, Object> createProduct(Integer categoryId, String name, String description,
                                              Integer price, Integer salePrice, Integer stock,
                                              String thumbnail, Boolean isActive, Boolean isFeatured,
                                              MultipartFile thumbnailFile) {
        if (categoryId == null || name == null || price == null) {
            throw new BadRequestException("필수 정보를 입력해주세요.");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));

        String thumbnailPath = thumbnailFile != null && !thumbnailFile.isEmpty()
                ? fileUploadService.uploadFile(thumbnailFile) : thumbnail;

        String slug = name.toLowerCase()
                .replaceAll("[^a-z0-9가-힣]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "") + "-" + System.currentTimeMillis();

        Product product = Product.builder()
                .category(category)
                .name(name)
                .slug(slug)
                .description(description)
                .price(price)
                .salePrice(salePrice)
                .stock(stock != null ? stock : 0)
                .thumbnail(thumbnailPath)
                .isActive(isActive != null ? isActive : true)
                .isFeatured(isFeatured != null ? isFeatured : false)
                .build();

        productRepository.save(product);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "상품이 등록되었습니다.");
        result.put("productId", product.getId());
        result.put("thumbnail", thumbnailPath);
        return result;
    }

    @Transactional
    public Map<String, Object> updateProduct(Integer id, Integer categoryId, String name, String description,
                                              Integer price, Integer salePrice, Integer stock,
                                              String thumbnail, Boolean isActive, Boolean isFeatured,
                                              MultipartFile thumbnailFile) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new NotFoundException("카테고리를 찾을 수 없습니다."));
            product.setCategory(category);
        }
        if (name != null) product.setName(name);
        if (description != null) product.setDescription(description);
        if (price != null) product.setPrice(price);
        product.setSalePrice(salePrice);
        if (stock != null) product.setStock(stock);
        if (isActive != null) product.setIsActive(isActive);
        if (isFeatured != null) product.setIsFeatured(isFeatured);

        String thumbnailPath;
        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            thumbnailPath = fileUploadService.uploadFile(thumbnailFile);
        } else if (thumbnail != null) {
            thumbnailPath = thumbnail;
        } else {
            thumbnailPath = product.getThumbnail();
        }
        product.setThumbnail(thumbnailPath);

        productRepository.save(product);

        return Map.of("message", "상품이 수정되었습니다.", "thumbnail", thumbnailPath != null ? thumbnailPath : "");
    }

    @Transactional
    public Map<String, String> deleteProduct(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        boolean hasOrders = orderItemRepository.existsByProductId(id);
        if (hasOrders) {
            product.setIsActive(false);
            productRepository.save(product);
            return Map.of("message", "상품이 비활성화되었습니다. (주문 이력 존재)");
        } else {
            productRepository.delete(product);
            return Map.of("message", "상품이 삭제되었습니다.");
        }
    }

    // ==================== Product Images ====================

    public Map<String, Object> getProductImages(Integer productId) {
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
        List<Map<String, Object>> imageList = images.stream().map(img -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", img.getId());
            m.put("product_id", img.getProduct().getId());
            m.put("image_url", img.getImageUrl());
            m.put("sort_order", img.getSortOrder());
            m.put("created_at", img.getCreatedAt());
            return m;
        }).toList();
        return Map.of("images", imageList);
    }

    @Transactional
    public Map<String, Object> addProductImages(Integer productId, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("이미지 파일이 필요합니다.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        long count = productImageRepository.countByProductId(productId);
        if (count + files.size() > 10) {
            throw new BadRequestException("상품당 최대 10개의 이미지만 등록 가능합니다.");
        }

        int maxOrder = productImageRepository.findMaxSortOrderByProductId(productId);

        for (int i = 0; i < files.size(); i++) {
            String imageUrl = fileUploadService.uploadFile(files.get(i));
            ProductImage image = ProductImage.builder()
                    .product(product)
                    .imageUrl(imageUrl)
                    .sortOrder(maxOrder + 1 + i)
                    .build();
            productImageRepository.save(image);
        }

        List<ProductImage> allImages = productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
        List<Map<String, Object>> imageList = allImages.stream().map(img -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", img.getId());
            m.put("product_id", img.getProduct().getId());
            m.put("image_url", img.getImageUrl());
            m.put("sort_order", img.getSortOrder());
            m.put("created_at", img.getCreatedAt());
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("message", "이미지가 추가되었습니다.");
        result.put("images", imageList);
        return result;
    }

    @Transactional
    public Map<String, String> deleteProductImage(Integer imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("이미지를 찾을 수 없습니다."));

        productImageRepository.delete(image);
        return Map.of("message", "이미지가 삭제되었습니다.");
    }

    // ==================== Users ====================

    public Map<String, Object> getUsers(int page, int limit, String search) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> userPage;
        if (search != null && !search.isEmpty()) {
            userPage = userRepository.findByNameOrEmailContaining(search, pageRequest);
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

        List<Map<String, Object>> users = userPage.getContent().stream().map(u -> {
            long orderCount = orderRepository.countByUserId(u.getId());
            long totalSpent = orderRepository.sumTotalSpentByUserId(u.getId());

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("name", u.getName());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole().name());
            map.put("created_at", u.getCreatedAt());
            map.put("order_count", orderCount);
            map.put("total_spent", totalSpent);
            return map;
        }).toList();

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", userPage.getTotalElements());
        pagination.put("totalPages", userPage.getTotalPages());

        Map<String, Object> result = new HashMap<>();
        result.put("users", users);
        result.put("pagination", pagination);
        return result;
    }

    public Map<String, Object> getUserDetail(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName());
        userMap.put("phone", user.getPhone());
        userMap.put("address", user.getAddress());
        userMap.put("address_detail", user.getAddressDetail());
        userMap.put("zipcode", user.getZipcode());
        userMap.put("role", user.getRole().name());
        userMap.put("created_at", user.getCreatedAt());

        List<Order> orders = orderRepository.findRecentByUserId(userId, PageRequest.of(0, 10));
        List<Map<String, Object>> orderList = orders.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", o.getId());
            m.put("order_number", o.getOrderNumber());
            m.put("total_amount", o.getTotalAmount());
            m.put("status", o.getStatus().name());
            m.put("created_at", o.getCreatedAt());
            return m;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("user", userMap);
        result.put("orders", orderList);
        return result;
    }

    @Transactional
    public Map<String, String> updateUserRole(Integer userId, String role, Integer currentUserId) {
        if (!"user".equals(role) && !"admin".equals(role)) {
            throw new BadRequestException("유효하지 않은 역할입니다.");
        }

        if (userId.equals(currentUserId)) {
            throw new BadRequestException("자신의 역할은 변경할 수 없습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        user.setRole(User.Role.valueOf(role));
        userRepository.save(user);

        return Map.of("message", "회원 역할이 변경되었습니다.");
    }

    // ==================== Categories ====================

    public Map<String, Object> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<Map<String, Object>> categoryList = categories.stream().map(c -> {
            long productCount = productRepository.countForAdmin(c.getSlug(), null);
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("slug", c.getSlug());
            map.put("description", c.getDescription());
            map.put("created_at", c.getCreatedAt());
            map.put("product_count", productCount);
            return map;
        }).toList();
        return Map.of("categories", categoryList);
    }

    // ==================== Rental Inquiries ====================

    public Map<String, Object> getRentalInquiries(int page, int limit, String status) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<RentalInquiry> inquiryPage;
        if (status != null && !status.isEmpty()) {
            inquiryPage = rentalInquiryRepository.findByStatusOrderByCreatedAtDesc(status, pageRequest);
        } else {
            inquiryPage = rentalInquiryRepository.findAllByOrderByCreatedAtDesc(pageRequest);
        }

        List<Map<String, Object>> inquiries = inquiryPage.getContent().stream().map(this::toInquiryMap).toList();

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", inquiryPage.getTotalElements());
        pagination.put("totalPages", inquiryPage.getTotalPages());

        Map<String, Object> result = new HashMap<>();
        result.put("inquiries", inquiries);
        result.put("pagination", pagination);
        return result;
    }

    public Map<String, Object> getRentalInquiryDetail(Integer id) {
        RentalInquiry inquiry = rentalInquiryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("문의를 찾을 수 없습니다."));
        return Map.of("inquiry", toInquiryMap(inquiry));
    }

    @Transactional
    public Map<String, Object> updateRentalInquiryStatus(Integer id, String status) {
        List<String> validStatuses = List.of("new", "contacted", "completed", "cancelled", "pending");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("유효하지 않은 상태입니다.");
        }

        RentalInquiry inquiry = rentalInquiryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("문의를 찾을 수 없습니다."));

        inquiry.setStatus(status);
        rentalInquiryRepository.save(inquiry);

        return Map.of("message", "문의 상태가 변경되었습니다.", "status", status);
    }

    @Transactional
    public Map<String, String> deleteRentalInquiry(Integer id) {
        RentalInquiry inquiry = rentalInquiryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("문의를 찾을 수 없습니다."));
        rentalInquiryRepository.delete(inquiry);
        return Map.of("message", "렌탈 문의가 삭제되었습니다.");
    }

    private Map<String, Object> toInquiryMap(RentalInquiry inquiry) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", inquiry.getId());
        map.put("name", inquiry.getName());
        map.put("email", inquiry.getEmail());
        map.put("phone", inquiry.getPhone());
        map.put("company", inquiry.getCompany());
        map.put("location", inquiry.getLocation());
        map.put("space_size", inquiry.getSpaceSize());
        map.put("message", inquiry.getMessage());
        map.put("status", inquiry.getStatus());
        map.put("created_at", inquiry.getCreatedAt());
        map.put("updated_at", inquiry.getUpdatedAt());
        return map;
    }
}
