package com.gugarden.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CartRequest {
    @NotNull(message = "상품 ID를 입력해주세요.")
    private Integer productId;

    @Min(value = 1, message = "수량은 1 이상이어야 합니다.")
    private Integer quantity = 1;
}
