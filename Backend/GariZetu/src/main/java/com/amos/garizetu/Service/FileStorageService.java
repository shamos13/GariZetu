package com.amos.garizetu.Service;


import com.amos.garizetu.config.FileStorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

//Responsible for handling file storage operations
@Service
@Slf4j
@RequiredArgsConstructor
public class FileStorageService {
    private final FileStorageProperties properties;
    private Path fileStorageLocation;


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
            log.info("File storage initialized successfully at: {}", this.fileStorageLocation);
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
        if (contentType == null ) {
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
        try{
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (Exception e) {
            log.error("Could not load file: {}", fileName, e);
            throw new RuntimeException("File not found: " + fileName, e);
        }
    }
    // Validates if the allowed MIME type is an allowed image type
    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/webp");
    }

    // Maps MIME type to file extension. this ensures we save files with the correct extension based on their actual type
    private String getExtensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
