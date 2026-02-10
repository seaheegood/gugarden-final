package com.gugarden.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class OrderRequest {
    @NotBlank(message = "받는 분 이름을 입력해주세요.")
    private String recipientName;

    @NotBlank(message = "받는 분 연락처를 입력해주세요.")
    private String recipientPhone;

    @NotBlank(message = "배송 주소를 입력해주세요.")
    private String recipientAddress;

    private String recipientAddressDetail;

    @NotBlank(message = "우편번호를 입력해주세요.")
    private String recipientZipcode;

    private String memo;
    private String paymentMethod = "naverpay";
}
