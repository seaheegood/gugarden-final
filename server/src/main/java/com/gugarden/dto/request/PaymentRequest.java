package com.gugarden.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PaymentRequest {
    @NotNull(message = "주문 ID를 입력해주세요.")
    private Integer orderId;

    private String paymentId;
    private String paymentKey;
    private Integer amount;
    private String reason;
    private String cancelReason;
}
