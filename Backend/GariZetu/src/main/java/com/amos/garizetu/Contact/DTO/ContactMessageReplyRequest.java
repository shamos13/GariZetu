package com.amos.garizetu.Contact.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageReplyRequest {

    @NotBlank(message = "Reply message is required")
    @Size(max = 1000, message = "Reply message cannot exceed 1000 characters")
    private String message;
}
