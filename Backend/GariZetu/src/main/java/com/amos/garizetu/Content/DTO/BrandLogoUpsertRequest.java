package com.amos.garizetu.Content.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandLogoUpsertRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 80, message = "Brand name cannot exceed 80 characters")
    private String brandName;

    @NotBlank(message = "Logo URL is required")
    @Size(max = 500, message = "Logo URL cannot exceed 500 characters")
    private String logoUrl;
}
