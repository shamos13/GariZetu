package com.amos.garizetu.User.DTO.Response;

import com.amos.garizetu.User.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private Long userId;
    private String userName;
    private String email;
    private String phoneNumber;
    private String userRole;
    private UserStatus status;
    private LocalDateTime lastLogin;

    //Time Stamps for admin
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
