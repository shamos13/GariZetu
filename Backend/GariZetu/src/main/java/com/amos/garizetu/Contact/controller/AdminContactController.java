package com.amos.garizetu.Contact.controller;

import com.amos.garizetu.Contact.DTO.AdminContactMessageResponse;
import com.amos.garizetu.Contact.DTO.ContactMessageReplyRequest;
import com.amos.garizetu.Contact.DTO.ContactMessageStatusUpdateRequest;
import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import com.amos.garizetu.Contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @GetMapping("/messages/paged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminContactMessageResponse>> getMessagesPaged(
            @RequestParam(required = false) ContactMessageStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = buildPageable(page, size);
        return ResponseEntity.ok(contactService.getAdminMessagesPage(status, pageable));
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

    private Pageable buildPageable(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
