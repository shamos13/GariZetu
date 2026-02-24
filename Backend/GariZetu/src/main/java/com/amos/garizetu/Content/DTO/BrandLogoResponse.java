package com.amos.garizetu.Content.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandLogoResponse {
    private String brandName;
    private String brandKey;
    private String logoUrl;
    private LocalDateTime updatedAt;
}
