package com.amos.garizetu.Contact.DTO;

import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminContactMessageResponse {
    private Long messageId;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private ContactMessageStatus messageStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ContactMessageReplyResponse> replies;
}
