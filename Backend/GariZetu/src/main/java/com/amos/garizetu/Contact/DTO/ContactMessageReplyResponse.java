package com.amos.garizetu.Contact.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageReplyResponse {
    private Long replyId;
    private String message;
    private String repliedBy;
    private LocalDateTime repliedAt;
}
