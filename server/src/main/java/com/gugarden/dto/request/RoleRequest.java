package com.gugarden.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RoleRequest {
    @NotBlank(message = "역할을 입력해주세요.")
    private String role;
}
