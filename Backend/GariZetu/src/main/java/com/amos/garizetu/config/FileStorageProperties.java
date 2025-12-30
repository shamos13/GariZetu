package com.amos.garizetu.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for file storage.
 * This class binds to properties in application.properties/yml
 * that start with "file.upload"
 *
 * Example in application.properties:
 * file.upload.directory=/var/uploads/gari-zetu/images
 */
@Component
@ConfigurationProperties(prefix = "file.upload")
@Data
public class FileStorageProperties {

    // This is the directory where uploaded files will be stored
    private String directory;

}
