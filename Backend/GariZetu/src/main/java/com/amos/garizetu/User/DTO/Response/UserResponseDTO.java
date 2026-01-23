package com.amos.garizetu.User.DTO.Response;

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

    //Time Stamps for admin
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
