package com.gugarden.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RentalInquiryRequest {
    private String name;
    private String email;
    private String phone;
    private String company;
    private String location;
    private String spaceSize;
    private String message;
}
