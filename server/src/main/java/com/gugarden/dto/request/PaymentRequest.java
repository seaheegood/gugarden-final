package com.gugarden.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PaymentRequest {
    private Integer orderId;
    private String paymentId;
    private String paymentKey;
    private Integer amount;
    private String reason;
    private String cancelReason;
}
