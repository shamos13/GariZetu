package com.amos.garizetu.Car.Enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FeaturedCategory {
    POPULAR_CAR("Popular Car"),
    LUXURY_CAR("Luxury Car"),
    VINTAGE_CAR("Vintage Car"),
    FAMILY_CAR("Family Car"),
    OFF_ROAD_CAR("Off-Road Car");

    private final String label;

    FeaturedCategory(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static FeaturedCategory fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim();
        for (FeaturedCategory category : values()) {
            if (category.label.equalsIgnoreCase(normalized) || category.name().equalsIgnoreCase(normalized)) {
                return category;
            }
        }

        throw new IllegalArgumentException("Unsupported featuredCategory: " + value);
    }
}
