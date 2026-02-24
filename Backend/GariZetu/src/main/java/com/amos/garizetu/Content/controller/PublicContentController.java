package com.amos.garizetu.Content.controller;

import com.amos.garizetu.Content.DTO.BrandLogoResponse;
import com.amos.garizetu.Content.service.ContentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
@Slf4j
public class PublicContentController {

    private final ContentService contentService;

    @GetMapping("/brand-logos")
    public ResponseEntity<List<BrandLogoResponse>> getBrandLogos() {
        log.debug("Fetching public brand logo overrides");
        return ResponseEntity.ok(contentService.getBrandLogoOverrides());
    }
}
