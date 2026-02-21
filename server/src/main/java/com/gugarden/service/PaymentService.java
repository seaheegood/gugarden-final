package com.gugarden.service;

import com.gugarden.entity.Order;
import com.gugarden.entity.OrderItem;
import com.gugarden.exception.BadRequestException;
import com.gugarden.exception.NotFoundException;
import com.gugarden.repository.OrderItemRepository;
import com.gugarden.repository.OrderRepository;
import com.gugarden.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final Environment environment;

    @Value("${app.naverpay.client-id:}")
    private String naverClientId;

    @Value("${app.naverpay.client-secret:}")
    private String naverClientSecret;

    @Value("${app.naverpay.chain-id:}")
    private String naverChainId;

    @Value("${app.client-url}")
    private String clientUrl;

    @Value("${app.toss.secret-key:}")
    private String tossSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private boolean isProductionProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    // ==================== NaverPay ====================

    public Map<String, Object> prepareNaverPay(Integer orderId, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.pending) {
            throw new BadRequestException("이미 처리된 주문입니다.");
        }

        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);

        String productName = items.size() > 1
                ? items.get(0).getProductName() + " 외 " + (items.size() - 1) + "건"
                : items.get(0).getProductName();

        if (naverClientId == null || naverClientId.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("네이버페이 테스트 모드: API 키 미설정 (orderId={})", orderId);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("testMode", true);
            result.put("message", "테스트 모드: 네이버페이 API 키가 설정되지 않았습니다.");
            result.put("orderId", orderId);
            result.put("orderNumber", order.getOrderNumber());
            result.put("totalAmount", order.getTotalAmount());
            return result;
        }

        // 실제 네이버페이 API 호출 로직
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("orderId", orderId);
        result.put("orderNumber", order.getOrderNumber());
        result.put("totalAmount", order.getTotalAmount());
        return result;
    }

    @Transactional
    public Map<String, Object> approveNaverPay(Integer orderId, String paymentId, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (naverClientId == null || naverClientId.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("네이버페이 테스트 승인: API 키 미설정 (orderId={})", orderId);
            order.setStatus(Order.OrderStatus.paid);
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("testMode", true);
            result.put("message", "테스트 결제가 완료되었습니다.");
            result.put("orderId", orderId);
            result.put("orderNumber", order.getOrderNumber());
            return result;
        }

        // 실제 네이버페이 승인 API 호출
        order.setStatus(Order.OrderStatus.paid);
        order.setPaymentKey(paymentId);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("orderId", orderId);
        result.put("orderNumber", order.getOrderNumber());
        result.put("paymentId", paymentId);
        return result;
    }

    @Transactional
    public Map<String, Object> cancelNaverPay(Integer orderId, String reason, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.paid) {
            throw new BadRequestException("결제된 주문만 취소할 수 있습니다.");
        }

        // 재고 복구
        restoreStock(orderId);

        order.setStatus(Order.OrderStatus.cancelled);
        orderRepository.save(order);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        if (naverClientId == null || naverClientId.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("네이버페이 테스트 취소: API 키 미설정 (orderId={})", orderId);
            result.put("testMode", true);
        }
        result.put("message", naverClientId == null || naverClientId.isEmpty() ? "테스트 결제가 취소되었습니다." : "결제가 취소되었습니다.");
        return result;
    }

    // ==================== TossPay ====================

    public Map<String, Object> prepareToss(Integer orderId, Integer userId, String userEmail) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.pending) {
            throw new BadRequestException("이미 처리된 주문입니다.");
        }

        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);
        String orderName = items.size() > 1
                ? items.get(0).getProductName() + " 외 " + (items.size() - 1) + "건"
                : items.get(0).getProductName();

        if (tossSecretKey == null || tossSecretKey.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("토스페이 테스트 모드: API 키 미설정 (orderId={})", orderId);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("testMode", true);
            result.put("message", "테스트 모드: 토스페이먼츠 API 키가 설정되지 않았습니다.");
            result.put("orderId", orderId);
            result.put("orderNumber", order.getOrderNumber());
            result.put("amount", order.getTotalAmount());
            result.put("orderName", orderName);
            return result;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("orderId", orderId);
        result.put("orderNumber", order.getOrderNumber());
        result.put("amount", order.getTotalAmount());
        result.put("orderName", orderName);
        result.put("customerName", order.getRecipientName());
        result.put("customerEmail", userEmail);
        return result;
    }

    @Transactional
    public Map<String, Object> confirmToss(Integer orderId, String paymentKey, Integer amount, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (!order.getTotalAmount().equals(amount)) {
            throw new BadRequestException("결제 금액이 일치하지 않습니다.");
        }

        if (tossSecretKey == null || tossSecretKey.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("토스페이 테스트 승인: API 키 미설정 (orderId={})", orderId);
            order.setStatus(Order.OrderStatus.paid);
            order.setPaymentMethod("toss");
            order.setPaymentKey(paymentKey != null ? paymentKey : "test_payment");
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("testMode", true);
            result.put("message", "테스트 결제가 완료되었습니다.");
            result.put("orderId", orderId);
            result.put("orderNumber", order.getOrderNumber());
            return result;
        }

        // 실제 토스 API 호출
        String encoded = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("paymentKey", paymentKey);
        body.put("orderId", order.getOrderNumber());
        body.put("amount", amount);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            if (response.getBody() != null && "DONE".equals(response.getBody().get("status"))) {
                order.setStatus(Order.OrderStatus.paid);
                order.setPaymentMethod("toss");
                order.setPaymentKey(paymentKey);
                order.setPaidAt(LocalDateTime.now());
                orderRepository.save(order);

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("orderId", orderId);
                result.put("orderNumber", order.getOrderNumber());
                result.put("paymentKey", paymentKey);
                return result;
            }
        } catch (Exception e) {
            throw new BadRequestException("결제 승인에 실패했습니다.");
        }

        throw new BadRequestException("결제 승인에 실패했습니다.");
    }

    @Transactional
    public Map<String, Object> cancelToss(Integer orderId, String cancelReason, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.paid) {
            throw new BadRequestException("결제된 주문만 취소할 수 있습니다.");
        }

        if (tossSecretKey == null || tossSecretKey.isEmpty()) {
            if (isProductionProfile()) {
                throw new BadRequestException("결제 서비스가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }
            log.warn("토스페이 테스트 취소: API 키 미설정 (orderId={})", orderId);
            restoreStock(orderId);
            order.setStatus(Order.OrderStatus.cancelled);
            orderRepository.save(order);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("testMode", true);
            result.put("message", "테스트 결제가 취소되었습니다.");
            return result;
        }

        // 실제 토스 취소 API
        String encoded = Base64.getEncoder().encodeToString((tossSecretKey + ":").getBytes());
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Basic " + encoded);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of("cancelReason", cancelReason != null ? cancelReason : "고객 요청에 의한 취소");

        try {
            restTemplate.exchange(
                    "https://api.tosspayments.com/v1/payments/" + order.getPaymentKey() + "/cancel",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            restoreStock(orderId);
            order.setStatus(Order.OrderStatus.cancelled);
            orderRepository.save(order);

            return Map.of("success", true, "message", "결제가 취소되었습니다.");
        } catch (Exception e) {
            throw new BadRequestException("결제 취소에 실패했습니다.");
        }
    }

    public Map<String, Object> getPaymentStatus(Integer orderId, Integer userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new NotFoundException("주문을 찾을 수 없습니다."));

        Map<String, Object> orderMap = new LinkedHashMap<>();
        orderMap.put("id", order.getId());
        orderMap.put("order_number", order.getOrderNumber());
        orderMap.put("status", order.getStatus().name());
        orderMap.put("total_amount", order.getTotalAmount());
        orderMap.put("paid_at", order.getPaidAt());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("order", orderMap);
        return result;
    }

    private void restoreStock(Integer orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderIdWithProduct(orderId);
        for (OrderItem item : items) {
            productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
        }
    }
}
