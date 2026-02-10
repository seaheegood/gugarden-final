package com.gugarden.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UpdateProfileRequest {
    @NotBlank(message = "이름을 입력해주세요.")
    private String name;

    private String phone;
    private String address;
    private String addressDetail;
    private String zipcode;
}
