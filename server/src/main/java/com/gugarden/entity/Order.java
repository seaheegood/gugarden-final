package com.gugarden.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "shipping_fee")
    @Builder.Default
    private Integer shippingFee = 0;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('pending','paid','preparing','shipped','delivered','cancelled')")
    @Builder.Default
    private OrderStatus status = OrderStatus.pending;

    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    @Column(name = "recipient_address", nullable = false, columnDefinition = "TEXT")
    private String recipientAddress;

    @Column(name = "recipient_address_detail")
    private String recipientAddressDetail;

    @Column(name = "recipient_zipcode", length = 10)
    private String recipientZipcode;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_key")
    private String paymentKey;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public enum OrderStatus {
        pending, paid, preparing, shipped, delivered, cancelled
    }
}
