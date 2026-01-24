package com.amos.garizetu.User.DTO.Request;

import com.amos.garizetu.User.UserRole;
import com.amos.garizetu.User.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {
    //username Optional: validated if provided
    @Size(min = 5, max = 15, message = "Username must be between 4 and 15 characters")
    private String userName;

    @Email(message = "Email must be valid")
    private String email;

    // Phone number update
    @Pattern(
            regexp = "^\\+?[1-9]\\d{1,14}$",
            message = "Phone number must be valid (E.164 format)"
    )
    private String phoneNumber;

    // Role change for ADMINS ONLY!!!!!
    private UserRole userRole;

    //Status change block/unblock. ADMINS ONLY!!
    private UserStatus status;

    //Typically require the old password and a separate endpoint
    @Size(min = 8, message = "Password must be 8 characters or more")
    private String password;
}

