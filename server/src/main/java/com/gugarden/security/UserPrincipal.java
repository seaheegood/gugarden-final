package com.gugarden.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserPrincipal {
    private Integer id;
    private String email;
    private String role;
}
