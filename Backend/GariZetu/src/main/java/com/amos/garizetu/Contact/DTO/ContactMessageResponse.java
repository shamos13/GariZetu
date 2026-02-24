package com.amos.garizetu.Contact.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageResponse {
    private Long messageId;
    private String message;
}
