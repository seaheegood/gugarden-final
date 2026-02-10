package com.gugarden.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class StatusRequest {
    @NotBlank(message = "상태를 입력해주세요.")
    private String status;
}
