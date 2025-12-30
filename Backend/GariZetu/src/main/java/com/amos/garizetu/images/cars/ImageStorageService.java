package com.amos.garizetu.images.cars;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface ImageStorageService {
    String uploadImage(MultipartFile file);
}
