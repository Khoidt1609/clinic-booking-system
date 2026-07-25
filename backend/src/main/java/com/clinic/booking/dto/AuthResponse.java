package com.clinic.booking.dto;


import com.clinic.booking.enums.Role;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String message;
}