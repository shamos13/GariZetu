package com.amos.garizetu.Service;


import com.amos.garizetu.config.FileStorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

//Responsible for handling file storage operations
@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {
    private final FileStorageProperties properties;
    private Path fileStorageLocation;
    private List<Path> fallbackStorageLocations = List.of();


    /**
     * This method runs automatically after the bean is created.
     * It creates the upload directory if it doesn't exist.
     *
     * @PostConstruct ensures this runs once at startup before any
     * other methods in this service are called.
     */

    @PostConstruct
    public void init() {
        try{

            //Configure the configured directory string to a path object
            this.fileStorageLocation = Paths.get(properties.getDirectory())
                    .toAbsolutePath().normalize();

            //Create the directory if they don't exist
            Files.createDirectories(this.fileStorageLocation);
            this.fallbackStorageLocations = resolveFallbackLocations(this.fileStorageLocation);
            log.info("File storage initialized successfully at: {}", this.fileStorageLocation);
            if (!this.fallbackStorageLocations.isEmpty()) {
                log.info("File storage fallback locations: {}", this.fallbackStorageLocations);
            }
        } catch (IOException ex){
            log.error("Could not initialize file storage at: {}", this.fileStorageLocation, ex);
            throw new RuntimeException("Could not initialize file storage at: " + this.fileStorageLocation, ex);
        }
    }

    //Stores an uploaded file with validation
    public String storeFile(MultipartFile file) {

        // Validation 1: Check if file is empty
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        //Validation 2: Check file Size (10MB = 10 * 1024 * 1024 bytes)
        long maxFileSize = 10 * 1024 * 1024;
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File exceeds maximum limit of 10MB");
        }

        // Validation 3: Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !isValidImageType(contentType)) {
            throw new RuntimeException("Invalid file type. Only JPEG, PNG, and WEBP images are allowed");
        }

        // Generate UUID based filename with proper Extension
        String fileExtension = getExtensionFromMimeType(contentType);
        String fileName = UUID.randomUUID().toString()  + fileExtension;

        try{

            // Resolve the target location for this file
            Path targetLocation = this.fileStorageLocation.resolve(fileName);

            //Copy file to target location
            //Replace Existing
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("File stored successfully at: {}", targetLocation);
            return fileName;
        }catch (IOException ex){
            log.error("Could not store file", ex);
            throw new RuntimeException("Could not store file", ex);
        }
    }

    // Loads the file as a resource for serving to clients
    public Resource loadFileAsResource(String fileName) {
        String normalizedFileName = StringUtils.cleanPath(fileName);
        if (normalizedFileName.contains("..")) {
            throw new RuntimeException("Invalid file path: " + fileName);
        }

        Resource resource = loadFileFromLocation(this.fileStorageLocation, normalizedFileName);
        if (resource != null) {
            return resource;
        }

        for (Path fallbackLocation : this.fallbackStorageLocations) {
            resource = loadFileFromLocation(fallbackLocation, normalizedFileName);
            if (resource != null) {
                log.info("Loaded file {} from fallback location {}", normalizedFileName, fallbackLocation);
                return resource;
            }
        }

        log.error("Could not load file: {}", normalizedFileName);
        throw new RuntimeException("File not found: " + normalizedFileName);
    }
    // Validates if the allowed MIME type is an allowed image type
    private boolean isValidImageType(String contentType) {
        return "image/jpeg".equals(contentType) ||
                "image/png".equals(contentType) ||
                "image/webp".equals(contentType);
    }

    // Maps MIME type to file extension. this ensures we save files with the correct extension based on their actual type
    private String getExtensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }

    private Resource loadFileFromLocation(Path location, String fileName) {
        try {
            Path filePath = location.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private List<Path> resolveFallbackLocations(Path primaryLocation) {
        Path workingDirectory = Paths.get("").toAbsolutePath().normalize();

        Set<Path> uniqueLocations = new LinkedHashSet<>();
        uniqueLocations.add(workingDirectory.resolve("uploads").normalize());
        uniqueLocations.add(workingDirectory.resolve("..").resolve("uploads").normalize());
        uniqueLocations.add(workingDirectory.resolve("..").resolve("..").resolve("uploads").normalize());

        List<Path> locations = new ArrayList<>();
        for (Path location : uniqueLocations) {
            Path absoluteLocation = location.toAbsolutePath().normalize();
            if (!absoluteLocation.equals(primaryLocation)) {
                locations.add(absoluteLocation);
            }
        }

        return locations;
    }
}
