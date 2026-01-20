package com.amos.garizetu.User.DTO.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationRequest {

    @NotBlank(message = "Username is required")
    @Size(min=5, max = 15, message = "UserName must be between 5 and 15 characters")
    private String userName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be  Valid")
    private String email;

    @NotBlank(message = "Password can not be blank")
    @Size(min = 8, message = "Password must be 8 characters or more")
    private String password;

    private String phoneNumber; // It can be optional

}
