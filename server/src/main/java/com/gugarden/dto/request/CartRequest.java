package com.gugarden.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CartRequest {
    private Integer productId;
    private Integer quantity = 1;
}
