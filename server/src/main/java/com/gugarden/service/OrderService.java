package com.gugarden.service;

import com.gugarden.dto.request.OrderRequest;
import com.gugarden.entity.*;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    private String generateOrderNumber() {
        LocalDate now = LocalDate.now();
        String year = now.format(DateTimeFormatter.ofPattern("yy"));
        String month = now.format(DateTimeFormatter.ofPattern("MM"));
        String day = now.format(DateTimeFormatter.ofPattern("dd"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "GG" + year + month + day + random;
    }

    public Map<String, Object> getOrders(Integer userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<Map<String, Object>> orderList = orders.stream().map(o -> {
            long itemCount = orderItemRepository.countByOrderId(o.getId());
            Map<String, Object> map = toOrderMap(o);
            map.put("item_count", itemCount);
            return map;
        }).toList();

        return Map.of("orders", orderList);
    }

    public Map<String, Object> getOrderDetail(Integer orderId, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);

        Map<String, Object> orderMap = toOrderMap(order);
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
    public Map<String, Object> createOrder(Integer userId, OrderRequest request) {
        if (request.getRecipientName() == null || request.getRecipientPhone() == null || request.getRecipientAddress() == null) {
            throw new BadRequestException("배송 정보를 입력해주세요.");
        }

        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProduct(userId);

        if (cartItems.isEmpty()) {
            throw new BadRequestException("장바구니가 비어있습니다.");
        }

        // 재고 확인
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStock() < ci.getQuantity()) {
                throw new BadRequestException(p.getName() + "의 재고가 부족합니다. (재고: " + p.getStock() + "개)");
            }
        }

        // 총 금액 계산
        int totalAmount = cartItems.stream().mapToInt(ci -> {
            int price = ci.getProduct().getSalePrice() != null ? ci.getProduct().getSalePrice() : ci.getProduct().getPrice();
            return price * ci.getQuantity();
        }).sum();

        // 배송비 계산 (5만원 이상 무료)
        int shippingFee = totalAmount >= 50000 ? 0 : 3000;

        // 주문 생성
        String orderNumber = generateOrderNumber();
        Order order = Order.builder()
                .user(User.builder().id(userId).build())
                .orderNumber(orderNumber)
                .totalAmount(totalAmount + shippingFee)
                .shippingFee(shippingFee)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .recipientAddress(request.getRecipientAddress())
                .recipientAddressDetail(request.getRecipientAddressDetail())
                .recipientZipcode(request.getRecipientZipcode())
                .memo(request.getMemo())
                .paymentMethod(request.getPaymentMethod())
                .build();

        orderRepository.save(order);

        // 주문 상품 추가 및 재고 차감
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            int price = p.getSalePrice() != null ? p.getSalePrice() : p.getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .productPrice(price)
                    .quantity(ci.getQuantity())
                    .build();
            orderItemRepository.save(orderItem);

            productRepository.decreaseStock(p.getId(), ci.getQuantity());
        }

        // 장바구니 비우기
        cartItemRepository.deleteByUserId(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "주문이 생성되었습니다.");
        result.put("orderId", order.getId());
        result.put("orderNumber", orderNumber);
        result.put("totalAmount", totalAmount + shippingFee);
        return result;
    }

    @Transactional
    public Map<String, String> cancelOrder(Integer orderId, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.pending && order.getStatus() != Order.OrderStatus.paid) {
            throw new BadRequestException("취소할 수 없는 주문입니다.");
        }

        // 재고 복구
        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);
        for (OrderItem item : items) {
            productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
        }

        order.setStatus(Order.OrderStatus.cancelled);
        orderRepository.save(order);

        return Map.of("message", "주문이 취소되었습니다.");
    }

    private Map<String, Object> toOrderMap(Order o) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", o.getId());
        map.put("user_id", o.getUser().getId());
        map.put("order_number", o.getOrderNumber());
        map.put("total_amount", o.getTotalAmount());
        map.put("shipping_fee", o.getShippingFee());
        map.put("status", o.getStatus().name());
        map.put("recipient_name", o.getRecipientName());
        map.put("recipient_phone", o.getRecipientPhone());
        map.put("recipient_address", o.getRecipientAddress());
        map.put("recipient_address_detail", o.getRecipientAddressDetail());
        map.put("recipient_zipcode", o.getRecipientZipcode());
        map.put("memo", o.getMemo());
        map.put("payment_method", o.getPaymentMethod());
        map.put("payment_key", o.getPaymentKey());
        map.put("paid_at", o.getPaidAt());
        map.put("created_at", o.getCreatedAt());
        map.put("updated_at", o.getUpdatedAt());
        return map;
    }
}
