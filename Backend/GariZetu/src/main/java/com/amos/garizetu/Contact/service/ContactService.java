package com.amos.garizetu.Contact.service;

import com.amos.garizetu.Contact.DTO.AdminContactMessageResponse;
import com.amos.garizetu.Contact.DTO.ContactMessageReplyRequest;
import com.amos.garizetu.Contact.DTO.ContactMessageReplyResponse;
import com.amos.garizetu.Contact.DTO.ContactMessageRequest;
import com.amos.garizetu.Contact.DTO.ContactMessageResponse;
import com.amos.garizetu.Contact.Entity.ContactMessage;
import com.amos.garizetu.Contact.Entity.ContactMessageReply;
import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import com.amos.garizetu.Contact.Repository.ContactMessageRepository;
import com.amos.garizetu.Repository.UserRepository;
import com.amos.garizetu.User.Entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final UserRepository userRepository;

    public ContactMessageResponse submitMessage(ContactMessageRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName().trim());
        message.setEmail(request.getEmail().trim());
        message.setPhone(request.getPhone().trim());
        message.setSubject(normalizeOptional(request.getSubject()));
        message.setMessage(request.getMessage().trim());
        message.setMessageStatus(ContactMessageStatus.NEW);

        ContactMessage saved = contactMessageRepository.save(message);

        log.info(
                "Contact message persisted with id {} from {} <{}>",
                saved.getMessageId(),
                saved.getName(),
                saved.getEmail()
        );

        return new ContactMessageResponse(
                saved.getMessageId(),
                "Your message has been received. Our team will get back to you shortly."
        );
    }

    @Transactional(readOnly = true)
    public List<AdminContactMessageResponse> getAdminMessages(ContactMessageStatus status) {
        List<ContactMessage> messages = status == null
                ? contactMessageRepository.findAllWithRepliesOrderByCreatedAtDesc()
                : contactMessageRepository.findAllByStatusWithRepliesOrderByCreatedAtDesc(status);

        return messages.stream()
                .map(this::toAdminResponse)
                .toList();
    }

    public AdminContactMessageResponse replyToMessage(Long messageId, ContactMessageReplyRequest request) {
        ContactMessage message = contactMessageRepository.findByIdWithReplies(messageId)
                .orElseThrow(() -> new RuntimeException("Contact message not found for ID " + messageId));

        ContactMessageReply reply = new ContactMessageReply();
        reply.setMessage(request.getMessage().trim());
        reply.setRepliedBy(resolveCurrentAdminIdentity());

        message.addReply(reply);
        message.setMessageStatus(ContactMessageStatus.REPLIED);

        ContactMessage saved = contactMessageRepository.save(message);
        log.info("Admin reply added for contact message {}", messageId);

        return toAdminResponse(saved);
    }

    public AdminContactMessageResponse updateMessageStatus(Long messageId, ContactMessageStatus status) {
        ContactMessage message = contactMessageRepository.findByIdWithReplies(messageId)
                .orElseThrow(() -> new RuntimeException("Contact message not found for ID " + messageId));

        message.setMessageStatus(status);
        ContactMessage saved = contactMessageRepository.save(message);

        log.info("Contact message {} status changed to {}", messageId, status);

        return toAdminResponse(saved);
    }

    private AdminContactMessageResponse toAdminResponse(ContactMessage message) {
        List<ContactMessageReplyResponse> replies = message.getReplies().stream()
                .sorted(Comparator.comparing(ContactMessageReply::getRepliedAt))
                .map(reply -> new ContactMessageReplyResponse(
                        reply.getReplyId(),
                        reply.getMessage(),
                        reply.getRepliedBy(),
                        reply.getRepliedAt()
                ))
                .toList();

        return new AdminContactMessageResponse(
                message.getMessageId(),
                message.getName(),
                message.getEmail(),
                message.getPhone(),
                message.getSubject(),
                message.getMessage(),
                message.getMessageStatus(),
                message.getCreatedAt(),
                message.getUpdatedAt(),
                replies
        );
    }

    private String resolveCurrentAdminIdentity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return "Admin";
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof String email && !"anonymousUser".equalsIgnoreCase(email)) {
            return resolveDisplayName(email);
        }

        if (principal instanceof UserDetails userDetails) {
            return resolveDisplayName(userDetails.getUsername());
        }

        String fallbackName = authentication.getName();
        if (StringUtils.hasText(fallbackName)) {
            return resolveDisplayName(fallbackName);
        }

        return "Admin";
    }

    private String resolveDisplayName(String emailOrUsername) {
        if (!StringUtils.hasText(emailOrUsername)) {
            return "Admin";
        }

        return userRepository.findByEmailIgnoreCase(emailOrUsername)
                .map(User::getUserName)
                .filter(StringUtils::hasText)
                .orElse(emailOrUsername);
    }

    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
