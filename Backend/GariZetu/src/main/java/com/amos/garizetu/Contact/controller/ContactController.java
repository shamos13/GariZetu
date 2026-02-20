package com.amos.garizetu.Contact.controller;

import com.amos.garizetu.Contact.DTO.ContactMessageRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class ContactController {

    @PostMapping("/messages")
    public ResponseEntity<Map<String, String>> submitMessage(
            @Valid @RequestBody ContactMessageRequest request
    ) {
        log.info(
                "Contact message received from {} <{}> | Subject: {}",
                request.getName(),
                request.getEmail(),
                request.getSubject()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("message", "Your message has been received. Our team will get back to you shortly.")
        );
    }
}
