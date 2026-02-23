package com.amos.garizetu.config;

import com.amos.garizetu.Car.Enums.FeaturedCategory;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToFeaturedCategoryConverter implements Converter<String, FeaturedCategory> {

    @Override
    public FeaturedCategory convert(String source) {
        return FeaturedCategory.fromValue(source);
    }
}
