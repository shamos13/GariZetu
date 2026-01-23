package com.amos.garizetu.User;

import com.amos.garizetu.Service.UserService;
import com.amos.garizetu.User.DTO.Request.UserLoginRequest;
import com.amos.garizetu.User.DTO.Request.UserRegistrationRequest;
import com.amos.garizetu.User.DTO.Response.LoginResponse;
import com.amos.garizetu.User.Entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final UserService userService;

    //Register a new User. return 201 response. Request Body JSON
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody UserRegistrationRequest request){
        log.info("Registering a new user: {}", request.getEmail());

        try {
            LoginResponse response = userService.registerUser(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {

            //if email already exists or another error
            log.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }

    }

    // Login and get JWT Token
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest request){
        log.info("Logging in user: {}", request.getEmail());

        try{
            LoginResponse response = userService.loginUser(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e){

            // if Email not found or password incorrect
            log.error("Error logging in user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/findusers")
    public ResponseEntity<List<User>> findAllUsers(){
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

}
