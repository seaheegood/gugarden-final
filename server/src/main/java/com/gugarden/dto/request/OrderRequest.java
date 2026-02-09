package com.gugarden.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class OrderRequest {
    private String recipientName;
    private String recipientPhone;
    private String recipientAddress;
    private String recipientAddressDetail;
    private String recipientZipcode;
    private String memo;
    private String paymentMethod = "naverpay";
}
