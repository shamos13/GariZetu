package com.amos.garizetu.Contact.controller;

import com.amos.garizetu.Contact.DTO.AdminContactMessageResponse;
import com.amos.garizetu.Contact.DTO.ContactMessageReplyRequest;
import com.amos.garizetu.Contact.DTO.ContactMessageStatusUpdateRequest;
import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import com.amos.garizetu.Contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/contact")
@RequiredArgsConstructor
@Slf4j
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminContactMessageResponse>> getMessages(
            @RequestParam(required = false) ContactMessageStatus status
    ) {
        log.info("Admin fetching contact messages with status filter: {}", status);
        return ResponseEntity.ok(contactService.getAdminMessages(status));
    }

    @PostMapping("/messages/{messageId}/replies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminContactMessageResponse> replyToMessage(
            @PathVariable Long messageId,
            @Valid @RequestBody ContactMessageReplyRequest request
    ) {
        log.info("Admin replying to contact message {}", messageId);
        return ResponseEntity.ok(contactService.replyToMessage(messageId, request));
    }

    @PatchMapping("/messages/{messageId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminContactMessageResponse> updateStatus(
            @PathVariable Long messageId,
            @Valid @RequestBody ContactMessageStatusUpdateRequest request
    ) {
        log.info("Admin updating contact message {} status to {}", messageId, request.getStatus());
        return ResponseEntity.ok(contactService.updateMessageStatus(messageId, request.getStatus()));
    }
}
