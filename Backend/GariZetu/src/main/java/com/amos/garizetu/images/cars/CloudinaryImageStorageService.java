package com.amos.garizetu.images.cars;

import com.cloudinary.Cloudinary;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

public class CloudinaryImageStorageService implements ImageStorageService {

    private final Cloudinary cloudinary;
    public CloudinaryImageStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String uploadImage(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            Map<?, ?> result = cloudinary.uploader().upload(
                    inputStream,
                    Map.of(
                            "folder", "garizetu/cars",
                            "resource_type", "image"
                    )
            );
            return result.get("secure_url").toString();
        }catch (IOException e){
            return null;
        }

    }
}
