package com.amos.garizetu.Contact.DTO;

import com.amos.garizetu.Contact.Enums.ContactMessageStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ContactMessageStatus status;
}
