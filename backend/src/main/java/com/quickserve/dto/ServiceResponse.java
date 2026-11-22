package com.quickserve.dto;

import java.math.BigDecimal;

import com.quickserve.entity.Service;

public record ServiceResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String category,
        String imageUrl) {

    public static ServiceResponse from(Service s) {
        return new ServiceResponse(s.getId(), s.getName(), s.getDescription(),
                s.getPrice(), s.getCategory(), s.getImageUrl());
    }
}
