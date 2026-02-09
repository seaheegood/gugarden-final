package com.gugarden.service;

import com.gugarden.entity.CartItem;
import com.gugarden.entity.Product;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.repository.CartItemRepository;
import com.gugarden.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public Map<String, Object> getCart(Integer userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProduct(userId);

        List<Map<String, Object>> items = cartItems.stream().map(ci -> {
            Product p = ci.getProduct();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", ci.getId());
            map.put("quantity", ci.getQuantity());
            map.put("product_id", p.getId());
            map.put("name", p.getName());
            map.put("price", p.getPrice());
            map.put("sale_price", p.getSalePrice());
            map.put("thumbnail", p.getThumbnail());
            map.put("stock", p.getStock());
            return map;
        }).toList();

        int totalAmount = cartItems.stream()
                .mapToInt(ci -> {
                    int price = ci.getProduct().getSalePrice() != null ? ci.getProduct().getSalePrice() : ci.getProduct().getPrice();
                    return price * ci.getQuantity();
                }).sum();

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("totalAmount", totalAmount);
        return result;
    }

    @Transactional
    public Map<String, String> addToCart(Integer userId, Integer productId, Integer quantity) {
        if (productId == null) {
            throw new BadRequestException("상품 ID가 필요합니다.");
        }

        Product product = productRepository.findByIdAndActive(productId)
                .orElseThrow(() -> new NotFoundException("상품을 찾을 수 없습니다."));

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            CartItem cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + (quantity != null ? quantity : 1));
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .user(com.gugarden.entity.User.builder().id(userId).build())
                    .product(product)
                    .quantity(quantity != null ? quantity : 1)
                    .build();
            cartItemRepository.save(cartItem);
        }

        return Map.of("message", "장바구니에 추가되었습니다.");
    }

    @Transactional
    public Map<String, String> updateQuantity(Integer cartItemId, Integer userId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BadRequestException("유효하지 않은 수량입니다.");
        }

        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new NotFoundException("장바구니 항목을 찾을 수 없습니다."));

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);

        return Map.of("message", "수량이 변경되었습니다.");
    }

    @Transactional
    public Map<String, String> removeItem(Integer cartItemId, Integer userId) {
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, userId)
                .orElseThrow(() -> new NotFoundException("장바구니 항목을 찾을 수 없습니다."));

        cartItemRepository.delete(cartItem);
        return Map.of("message", "삭제되었습니다.");
    }

    @Transactional
    public Map<String, String> clearCart(Integer userId) {
        cartItemRepository.deleteByUserId(userId);
        return Map.of("message", "장바구니가 비워졌습니다.");
    }
}
