package com.amos.garizetu.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Data
@ConfigurationProperties(prefix = "jwt")
public class JWTConfig {
    private String secret;
    private long expiration;
}

// This class handles getting the JWTConfig