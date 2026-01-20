package com.amos.garizetu.User.mapper;

import com.amos.garizetu.User.DTO.Request.UserRegistrationRequest;
import com.amos.garizetu.User.DTO.Response.LoginResponse;
import com.amos.garizetu.User.Entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    // Converts registration request to user entity
    // @param request - This is the registration data from user

    public User toEntity(UserRegistrationRequest request){
        if (request == null){
            return null;
        }

        User user = new User();
        user.setUserName(request.getUserName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        return user;

        // Password will be set separately after Hashing, id and timestamps handled automatically
    }

    // Converts user entity to login response DTO
    public LoginResponse toLoginResponse(User user, String token){
        if (user == null){
            return null;
        }

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setEmail(user.getEmail());
        response.setRole(user.getUserRole().name()); // converts enum to string
        return response;
    }
}
