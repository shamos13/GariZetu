package com.amos.garizetu.Contact.controller;

import com.amos.garizetu.Contact.DTO.ContactMessageRequest;
import com.amos.garizetu.Contact.DTO.ContactMessageResponse;
import com.amos.garizetu.Contact.service.ContactService;
import com.amos.garizetu.Content.DTO.ContactSectionSettingsResponse;
import com.amos.garizetu.Content.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final ContactService contactService;
    private final ContentService contentService;

    @PostMapping("/messages")
    public ResponseEntity<ContactMessageResponse> submitMessage(
            @Valid @RequestBody ContactMessageRequest request
    ) {
        log.info("Public contact message received from {} <{}>", request.getName(), request.getEmail());
        ContactMessageResponse response = contactService.submitMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/settings")
    public ResponseEntity<ContactSectionSettingsResponse> getContactSettings() {
        return ResponseEntity.ok(contentService.getContactSettings());
    }
}
