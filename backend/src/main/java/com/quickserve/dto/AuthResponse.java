package com.quickserve.dto;

import com.quickserve.entity.Role;
import com.quickserve.entity.User;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        String phone,
        Role role) {

    public static AuthResponse of(User user, String token) {
        return new AuthResponse(token, user.getId(), user.getName(),
                user.getEmail(), user.getPhone(), user.getRole());
    }
}
